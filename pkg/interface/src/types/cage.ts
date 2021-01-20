import { ContactUpdate } from "./contact-update";
import { InviteUpdate } from "@urbit/api/invite";
import { LocalUpdate } from "./local-update";
import { MetadataUpdate } from "./metadata-update";
import { GroupUpdate } from "./group-update";
import { LaunchUpdate, WeatherState } from "./launch-update";
import { ConnectionStatus } from "./connection";

interface MarksToTypes {
  readonly json: any;
  readonly "contact-update": ContactUpdate;
  readonly "invite-update": InviteUpdate;
  readonly "metadata-update": MetadataUpdate;
  readonly groupUpdate: GroupUpdate;
  readonly "launch-update": LaunchUpdate;
  readonly "link-listen-update": LinkListenUpdate;
  // not really marks but w/e
  readonly 'local': LocalUpdate;
  readonly 'weather': WeatherState | {};
  readonly 'location': string;
  readonly 'connection': ConnectionStatus;
}

export type Cage = Partial<MarksToTypes>;

export type Mark = keyof MarksToTypes;
