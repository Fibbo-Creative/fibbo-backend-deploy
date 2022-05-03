import Profile from "../models/profile.js";

export const getProfileInfo = async (wallet) => {
  const profileInfo = await Profile.findOne({ wallet: wallet });
  if (profileInfo) return profileInfo;
};

export const updateUsername = async (wallet, username) => {
  const updatedProfile = await Profile.findOneAndUpdate(
    { wallet: wallet },
    { username: username }
  );
  return updatedProfile;
};

export const updateProfileImg = async (wallet, image) => {
  const updatedProfile = await Profile.findOneAndUpdate(
    { wallet: wallet },
    { profileImg: image }
  );
  return updatedProfile;
};

export const updateProfileBanner = async (wallet, image) => {
  const updatedProfile = await Profile.findOneAndUpdate(
    { wallet: wallet },
    { profileBanner: image }
  );
  return updatedProfile;
};
