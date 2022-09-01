import { formatOffers, getItemOffers } from "../utils/offers.js";

export default class OffersController {
  constructor() {}

  static async getOffers(req, res) {
    try {
      const { collection, tokenId } = req.query;
      //Buscaremos primero en los títulos de los items

      const offersFromNft = await getItemOffers(collection, tokenId);
      const formattedResult = await formatOffers(offersFromNft);
      res.send(formattedResult);
    } catch (e) {
      res.status(500).send(e);
    }
  }

  static async offerAccepted(req, res) {
    try {
      const { collection, tokenId, creator } = req.query;
      //Buscaremos primero en los títulos de los items

      const offersFromNft = await getItemOffers(collection, tokenId);
      const formattedResult = await formatOffers(offersFromNft);
      res.send(formattedResult);
    } catch (e) {
      res.status(500).send(e);
    }
  }
}
