import {UpdateMoment} from './UpdateMoment';

export interface AppInfoRequest {
  versioning?: Versioning;
  appVersion: string;
  environment: string;
}
interface Versioning {
  [key: string]: VersionInfo;
}
interface VersionInfo {
  isBookType: boolean;
  version: string;
  updateMoment: UpdateMoment;
}
