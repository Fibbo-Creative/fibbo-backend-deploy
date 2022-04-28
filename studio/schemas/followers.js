export const followerSchema = {
  name: "follower",
  title: "Followers",
  type: "document",
  fields: [
    {
      name: "from",
      title: "Follower",
      type: "string",
    },
    {
      name: "to",
      title: "Followed",
      type: "string",
    },
  ],
};
