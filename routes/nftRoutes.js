import {
  registerListingEvent,
  registerMintEvent,
  registerTransferEvent,
} from "./utils.js";

import { uploadToCDN } from "../utils/sanity.js";
import { removeFiles } from "../utils/multer.js";

export default (app, upload, imgsDir, sanity_client) => {
  app.get("/getAllNfts", async (req, res) => {
    console.log("Fetching collections");

    const query =
      '*[_type == "nft"] {name, description, owner, image, royalty}';

    const allNfts = await sanity_client.fetch(query);

    res.status(200).send(allNfts);
  });

  app.get("/getNftsForSale", async (req, res) => {
    const query =
      '*[_type == "nftForSale"] {name, price, forSaleAt, nft->{image, collectionAddress, itemId, royalty}}';

    const allNftsForSale = await sanity_client.fetch(query);

    res.status(200).send(allNftsForSale);
  });

  app.get("/getNftInfoById", async (req, res) => {
    const { collection, nftId } = req.query;

    console.log(collection, nftId);

    if (!nftId) {
      res.status(204).send("No identifier supplied");
    }
    const query = `*[_type == "nft" && itemId==${nftId} && collectionAddress=="${collection}"] {_id, itemId, name, description, owner, creator, image, royalty}`;

    const nft = await sanity_client.fetch(query);
    console.log(nft);
    if (nft.length > 0) {
      let nftResult = nft[0];

      const forSaleQuery = `*[_type == "nftForSale" && collectionAddress=='${collection}' && tokenId==${nftId}] {_id, itemId, price, forSaleAt}`;

      const nftForSale = await sanity_client.fetch(forSaleQuery);

      if (nftForSale.length > 0) {
        nftResult = {
          ...nftResult,
          forSale: true,
          price: nftForSale[0].price,
          forSaleAt: nftForSale[0].forSaleAt,
          forSaleItemId: nftForSale[0].itemId,
        };
      } else {
        nftResult = {
          ...nftResult,
          forSale: false,
        };
      }
      res.status(200).send(nftResult);
    } else {
      res.status(205).send("Nft with id not found!");
    }
  });

  app.get("/getNftsByAddress", async (req, res) => {
    const { address } = req.query;

    if (!address) {
      res.status(204).send("No address supplied");
    }

    const query = `*[_type == "nft" && owner=="${address}" ] {name, collectionAddress, itemId, description, owner, image, royalty}`;

    const nfts = await sanity_client.fetch(query);

    res.status(200).send(nfts);
  });

  app.post("/uploadTestImg", upload.single("image"), async (req, res) => {
    const image = req.file;
    const uploadedImgSanity = await uploadToCDN(
      sanity_client,
      image ? image : null,
      imgsDir
    );

    await removeFiles(imgsDir);

    res.send(uploadedImgSanity.url);
  });

  app.post("/newNftItem", async (req, res) => {
    const {
      collection,
      name,
      description,
      creator,
      itemId,
      royalty,
      sanityImgUrl,
    } = req.body;

    console.log(collection);

    const queryCollections = `*[_type=="collection" && contractAddress=="${collection}"] {_id, name}`;

    const collectionInfo = await sanity_client.fetch(queryCollections);
    console.log(collectionInfo);
    if (collectionInfo.length > 0) {
      const collectionId = collectionInfo[0]._id;
      const doc = {
        _type: "nft",
        _id: `fibbo-${collection}-${itemId}`,
        name: name,
        description: description,
        owner: creator,
        creator: creator,
        itemId: parseInt(itemId),
        royalty: parseFloat(royalty),
        image: sanityImgUrl,
        collectionAddress: collection,
        collection: {
          _type: "reference",
          _ref: collectionId,
        },
      };

      const createdDoc = await sanity_client.create(doc);

      //Add nft transfer/Creation

      //Register item minted!

      await registerMintEvent(sanity_client, collection, itemId, creator);

      await sanity_client
        .patch(collectionId)
        .set({ numberOfItems: itemId })
        .commit();
      res.send(createdDoc);
    } else {
      res.status(205).send("Collection not found");
    }
  });

  app.post("/putForSale", async (req, res) => {
    const { collectionAddress, itemId, forSaleItemId, owner, price } = req.body;
    if (!itemId || !owner || !price) {
      res.status(204).send("No params supplied");
    }

    const query = `*[_type=="nft" && owner=="${owner}" && itemId==${itemId} && collectionAddress=='${collectionAddress}'] {_id, name, description, owner, image, royalty}`;

    const nftQuery = await sanity_client.fetch(query);

    const nft = nftQuery[0];

    if (nft) {
      const nftSanityId = nft._id;
      const nftInBdOwner = nft.owner;
      const nftName = nft.name;
      if (owner !== nftInBdOwner) {
        res.status(205).send("Address suplied is not the owner!");
      } else {
        const doc = {
          _type: "nftForSale",
          _id: `${nftSanityId}-forSale`,
          name: nftName,
          nft: {
            _type: "reference",
            _ref: nftSanityId,
          },
          itemId: forSaleItemId,
          tokenId: itemId,
          collectionAddress: collectionAddress,
          price: price,
          forSaleAt: new Date().toISOString().split("T")[0],
        };

        const createdDoc = await sanity_client.create(doc);

        await registerListingEvent(
          sanity_client,
          collectionAddress,
          itemId,
          owner,
          price
        );
        res.status(200).send(createdDoc);
      }
    }
  });

  app.post("/nftBought", async (req, res) => {
    const {
      prevOwner,
      newOwner,
      boughtFor,
      sanityItemId,
      nftItemId,
      nftForSaleItemId,
      collectionAddress,
    } = req.body;
    if (!prevOwner || !newOwner || !boughtFor || !sanityItemId || !nftItemId) {
      res.status(204).send("No params supplied");
    }

    try {
      //Update NFT new Owner...
      await sanity_client
        .patch(sanityItemId)
        .set({
          owner: newOwner,
        })
        .commit();

      //Create transfer doc

      await sanity_client.delete({
        query: `*[_type == "nftForSale" && _id=="${sanityItemId}-forSale"]`,
      });

      const eventCreated = await registerTransferEvent(
        sanity_client,
        collectionAddress,
        nftItemId,
        prevOwner,
        newOwner,
        boughtFor
      );

      res.status(200).send(eventCreated);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  });

  app.post("/makeOffer", async (req, res) => {});

  app.get("/getCollectionData", async (req, res) => {
    const { collection } = req.query;

    const queryCollections = `*[_type=="collection" && contractAddress=="${collection}"] {_id, name, contractAddress, numberOfItems }`;

    const collectionInfo = await sanity_client.fetch(queryCollections);
    console.log(collectionInfo);
    if (collectionInfo.length > 0) {
      res.status(200).send(collectionInfo[0]);
    }
  });

  app.get("/getItemHistory", async (req, res) => {
    const { collection, tokenId } = req.query;

    console.log(collection, tokenId);
    const query = `*[_type=="event" && collectionAddress=="${collection}" && tokenId==${tokenId}] {_id, eventType, from, to, timestamp, price, _createdAt } | order(_createdAt asc)`;

    const result = await sanity_client.fetch(query);

    console.log(result);

    res.status(200).send(result);
  });

  //Profile endpoints
  app.post("/newProfile", async (req, res) => {
    const { wallet } = req.body;
    console.log(wallet);
    const profileDoc = {
      _type: "profile",
      _id: `profile-${wallet}`,
      wallet: wallet,
      username: "Fibbo Artist",
      profileImg: `https://avatars.dicebear.com/api/bottts/${wallet}.svg`,
      profileBanner: "",
      following: [],
      followers: [],
    };

    const createdProfile = await sanity_client.create(profileDoc);
    res.status(200).send(createdProfile);
  });

  app.get("/userProfile", async (req, res) => {
    const { wallet } = req.query;

    const query = `*[_type == "profile" && wallet=='${wallet}' ] {wallet, username, profileImg, profileBanner, following, followers}`;

    const userProfile = await sanity_client.fetch(query);
    if (userProfile.length > 0) {
      let profileResult = userProfile[0];
      res.status(200).send(profileResult);
    } else {
      res.status(205).send("Profile not found!");
    }
  });

  app.post("/uploadProfileImg", upload.single("image"), async (req, res) => {
    const image = req.file;
    const { wallet } = req.body;

    const uploadedImgSanity = await uploadToCDN(
      sanity_client,
      image ? image : null,
      imgsDir
    );
    //Add nft transfer/Creation

    const query = `*[_type == "profile" && wallet=='${wallet}' ] {_id,wallet, username, profileImg, profileBanner, following, followers}`;

    const userProfile = await sanity_client.fetch(query);
    if (userProfile.length > 0) {
      const profileImgUrl = uploadedImgSanity.url;

      await sanity_client
        .patch(userProfile[0]._id)
        .set({
          profileImg: profileImgUrl,
        })
        .commit();

      await removeFiles(imgsDir);

      res.status(200).send(profileImgUrl);
    } else {
    }
  });

  app.post("/uploadBannerImg", upload.single("image"), async (req, res) => {
    const image = req.file;
    const { wallet } = req.body;

    const uploadedImgSanity = await uploadToCDN(
      sanity_client,
      image ? image : null,
      imgsDir
    );

    const query = `*[_type == "profile" && wallet=='${wallet}' ] {_id,wallet, username, profileImg, profileBanner, following, followers}`;

    const userProfile = await sanity_client.fetch(query);
    if (userProfile.length > 0) {
      const bannerImgUrl = uploadedImgSanity.url;

      await sanity_client
        .patch(userProfile[0]._id)
        .set({
          profileBanner: bannerImgUrl,
        })
        .commit();

      await removeFiles(imgsDir);

      res.status(200).send(bannerImgUrl);
    } else {
      res.status(205).send("Profile not found!");
    }
    //Add nft transfer/Creation
  });

  app.post("/uploadUsername", async (req, res) => {
    const { username, wallet } = req.body;

    const query = `*[_type == "profile" && wallet=='${wallet}' ] {_id,wallet, username, profileImg, profileBanner, following, followers}`;

    const userProfile = await sanity_client.fetch(query);
    if (userProfile.length > 0) {
      await sanity_client
        .patch(userProfile[0]._id)
        .set({
          username: username,
        })
        .commit();

      res.status(200).send("Profile Updated");
    } else {
      res.status(205).send("Profile not found!");
    }
  });

  app.post("/followUser", async (req, res) => {
    const { from, to } = req.body;

    const followerQuery = `*[_type == "profile" && wallet=='${from}' ] {_id, wallet, username, profileImg, profileBanner, following, followers}`;

    const followingQuery = `*[_type == "profile" && wallet=='${to}' ] {_id, wallet, username, profileImg, profileBanner, following, followers}`;

    const followerProfile = await sanity_client.fetch(followerQuery);
    const followingProfile = await sanity_client.fetch(followingQuery);

    if (followerProfile.length > 0) {
      //Update Following array
      console.log(followerProfile, followingProfile);
      await sanity_client
        .patch(followerProfile[0]._id)
        .append("following", [to])
        .commit();
    }

    if (followingProfile.length > 0) {
      //Update Followers array
      await sanity_client
        .patch(followingProfile[0]._id)
        .append("followers", [from])
        .commit();
    }

    res.status(200).send("OK");
  });
};
