// First, we must import the schema creator
import createSchema from "part:@sanity/base/schema-creator";

// Then import schema types from any plugins that might expose them
import schemaTypes from "all:part:@sanity/base/schema-type";
import { nftSchema } from "./nft";
import { transferSchema } from "./transfer";
import { nftForSaleSchema } from "./nftForSale";
import { offerSchema } from "./offer";
import { profileSchema } from "./profile";
import { collectionSchema } from "./collection";
import { eventShema } from "./events";
import { followerSchema } from "./followers";
// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: "default",
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    /* Your types here! */
    nftSchema,
    nftForSaleSchema,
    transferSchema,
    offerSchema,
    profileSchema,
    collectionSchema,
    eventShema,
    followerSchema,
  ]),
});
