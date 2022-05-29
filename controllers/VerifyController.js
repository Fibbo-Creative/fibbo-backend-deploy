import { getProfileInfo } from "../utils/profiles.js";
import {
  createVerifyRequest,
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
          const { _id, proposer, description } = request;
          const profileData = await getProfileInfo(proposer);
          return {
            _id: _id,
            proposer: proposer,
            description: description,
            profileData: profileData,
          };
        })
      );
      console.log(formatted);
      res.status(200).send(formatted);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  //POST
  static async newVerifyRequest(req, res) {
    try {
      const { proposer, description } = req.body;

      const doc = {
        proposer: proposer,
        description: description,
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
}
