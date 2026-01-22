import { admin } from "./admin";
import { auth } from "./auth";
import { notification } from "./notification";
import { store } from "./store";
import { upload } from "./uploads";
import { follow } from "./follow";
import { experience } from "./admin/experience";
import { education } from "./admin/education";

export const api = {
  admin,
  auth,
  store,
  upload,
  notification,
  follow,
  experience,
  education,
};
