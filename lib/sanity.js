import dotenv from "dotenv";
import sanityClient from "@sanity/client";

dotenv.config();

const { SANITY_TOKEN, SANITY_PROJECT_ID, SANITY_DATASET } = process.env;

const sanity_client = sanityClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: "2021-03-25", // use current UTC date - see "specifying API version"!
  token: SANITY_TOKEN, // or leave blank for unauthenticated usage
  useCdn: true, // `false` if you want to ensure fresh data
});

export default sanity_client;
