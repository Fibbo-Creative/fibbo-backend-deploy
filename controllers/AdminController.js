import { getOldBalance, getOldGasStation } from "../utils/admin.js";

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
}
