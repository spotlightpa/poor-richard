import {
  funnelStatus as status,
  statusNewUser,
  statusReturner,
  statusSubscriber,
  statusMember,
} from "../utils/metrics.js";

export default function funnelStatus() {
  return {
    get isNewUser() {
      return status === statusNewUser;
    },
    get isReturner() {
      return status >= statusReturner;
    },
    get isSubscriber() {
      return status >= statusSubscriber;
    },
    get isMember() {
      return status >= statusMember;
    },
  };
}
