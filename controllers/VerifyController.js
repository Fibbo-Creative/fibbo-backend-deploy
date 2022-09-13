import { getVerificationContract } from "../contracts/index.js";
import { getProfileInfo, verifyArtistInDb } from "../utils/profiles.js";
import {
  createVerifyRequest,
  deleteRequest,
  getAllRequests,
} from "../utils/verifyRequests.js";

export default class VerifyController {
  constructor() {}
  //GET
  static async getRequests(req, res) {
    try {
      const requests = await getAllRequests();
      let formatted = await Promise.all(
        requests.map(async (request) => {
          const { _id, proposer, name, lastName, description, email } = request;
          const profileData = await getProfileInfo(proposer);
          return {
            _id: _id,
            requestData: {
              name: name,
              proposer: proposer,
              lastName: lastName,
              description: description,
              email: email,
            },
            profileData: profileData,
          };
        })
      );
      res.status(200).send(formatted);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  //POST
  static async newVerifyRequest(req, res) {
    try {
      const { proposer, description, name, lastName, email } = req.body;

      const doc = {
        proposer: proposer,
        name: name,
        lastName: lastName,
        description: description,
        email: email,
      };

      const newRequest = await createVerifyRequest(doc);
      if (newRequest) {
        res.status(200).send(newRequest);
      } else {
        res.status(500).send("Error creating request");
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  }

  static async verifyNewArtist(req, res) {
    try {
      const { artist } = req.body;

      const VERIFICATION_CONTRACT = await getVerificationContract();
      const verifyTx = await VERIFICATION_CONTRACT.verificateAddress(artist);

      await verifyTx.wait();

      await verifyArtistInDb(artist);

      await deleteRequest(artist);

      res.status(200).send("verified " + artist);
    } catch (e) {
      console.log(e);
    }
  }

  static async declineRequest(req, res) {
    try {
      const { proposer } = req.body;

      await deleteRequest(proposer);

      res.status(200).send("declined " + proposer);
    } catch (e) {
      console.log(e);
    }
  }
}
