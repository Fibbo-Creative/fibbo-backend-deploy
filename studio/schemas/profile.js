export const profileSchema = {
  name: "profile",
  title: "User Profile",
  type: "document",
  fields: [
    {
      name: "wallet",
      title: "Wallet",
      type: "string",
    },
    {
      name: "username",
      title: "Username",
      type: "string",
    },
    {
      name: "profileImg",
      title: "Profile Image",
      type: "string",
    },
    {
      name: "profileBanner",
      title: "Profile Banner",
      type: "string",
    },
    {
      name: "followers",
      title: "Followers",
      type: "array",
      of: [
        {
          type: "string",
        },
      ],
    },
    {
      name: "following",
      title: "Following",
      type: "array",
      of: [
        {
          type: "string",
        },
      ],
    },
  ],
};
