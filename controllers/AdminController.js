import { parseEther } from "ethers/lib/utils.js";
import { gasStation } from "../contracts/address.js";
import { managerWallet } from "../contracts/index.js";
import {
  findUser,
  findUserByToken,
  getOldBalance,
  getOldGasStation,
} from "../utils/admin.js";
import { addCategory } from "../utils/categories.js";
import { getCollectionInfo } from "../utils/collections.js";
import { getNftInfo, getNftInfoById } from "../utils/nfts.js";
import { getProfileInfo } from "../utils/profiles.js";
import {
  addReport,
  deleteReport,
  getCollectionReports,
  getItemReports,
  getProfileReports,
} from "../utils/reports.js";

export default class AdminController {
  constructor() {}

  static async getLastBalance(req, res) {
    try {
      //Buscaremos primero en los títulos de los items

      const oldBalance = await getOldBalance();

      res.send({ balance: oldBalance.balance });
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async getLastGasStation(req, res) {
    try {
      //Buscaremos primero en los títulos de los items

      const oldBalance = await getOldGasStation();

      res.status(200).send({ balance: oldBalance.balance });
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async getAllReports(req, res) {
    try {
      //Buscaremos primero en los títulos de los items

      const col = await getCollectionReports();
      const nft = await getItemReports();
      const profile = await getProfileReports();

      const formattedCol = [];
      await Promise.all(
        col.map(async (item) => {
          const collectionInfo = await getCollectionInfo(
            item.reported.collection
          );
          let res = {
            ...item,
            reported: {
              ...reported,
              collection: collectionInfo,
            },
          };
          formattedCol.push(res);
        })
      );

      const formatedNfts = [];
      await Promise.all(
        nft.map(async (item) => {
          const nftInfo = await getNftInfoById(
            item.reported.tokenId,
            item.reported.collection
          );
          let res = {
            ...item,
            reported: {
              ...reported,
              nft: nftInfo,
            },
          };
          formatedNfts.push(res);
        })
      );

      const formattedProfiles = [];
      await Promise.all(
        col.map(async (item) => {
          const profileInfo = await getProfileInfo(item.profile);
          let res = {
            ...item,
            reported: {
              ...reported,
              profile: profileInfo,
            },
          };
          formattedProfiles.push(res);
        })
      );

      res.status(200).send({
        collections: formattedCol,
        item: formatedNfts,
        profiles: formattedProfiles,
      });
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.query;
      //Buscaremos primero en los títulos de los items

      const user = await findUser(email, password);
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(205).send(null);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async loginToken(req, res) {
    try {
      const { token } = req.query;
      //Buscaremos primero en los títulos de los items

      const user = await findUserByToken(token);
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(205).send(null);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async newCategory(req, res) {
    try {
      const { espName, engName, identifier, icon } = req.body;
      //Buscaremos primero en los títulos de los items

      const doc = {
        name: {
          eng: engName,
          esp: espName,
        },
        identifier,
        icon,
      };

      const newCat = await addCategory(doc);
      res.status(200).send(newCat);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async addNewReport(req, res) {
    try {
      const { reporter, descr, reported, type } = req.body;
      //Buscaremos primero en los títulos de los items

      const doc = {
        type: type,
        reporter: reporter,
        description: descr,
        reported: reported,
      };

      const newRep = await addReport(doc);
      res.status(200).send(newRep);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async deleteReport(req, res) {
    try {
      const { reporter, reported, type } = req.body;
      //Buscaremos primero en los títulos de los items

      const deleted = await deleteReport(type, reported, reporter);
      res.status(200).send(deleted);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async deposit(req, res) {
    try {
      const { token, value } = req.body;
      //Buscaremos primero en los títulos de los items

      if (!token) {
        res.status(500).send("NOT AUTH");
      } else {
        const userInfo = await findUserByToken(token);
        if (!userInfo) {
          res.status(500).send("NOT AUTH");
        } else {
          console.log(value);

          const formatted = parseEther(value.toString());
          const sendToGasToGasStation = {
            from: managerWallet.address,
            to: gasStation,
            value: formatted,
          };

          const tx = await managerWallet.sendTransaction(sendToGasToGasStation);

          res.status(200).send(tx.data);
        }
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }
}
