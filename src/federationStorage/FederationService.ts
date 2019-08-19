/**
 * Copyright 2018-2019 Symlink GmbH
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */



import { PkStorageFederation, PkStorage, MsFederation } from "@symlinkde/eco-os-pk-models";
import { injectable } from "inversify";
import { storageContainer, STORAGE_TYPES } from "@symlinkde/eco-os-pk-storage";
import Config from "config";
import { bootstrapperContainer } from "@symlinkde/eco-os-pk-core";

@injectable()
export class FederationService implements PkStorageFederation.IFederationService {
  private federationRepro: PkStorage.IMongoRepository<MsFederation.IFederationStorageObject>;

  public constructor() {
    storageContainer.bind(STORAGE_TYPES.Collection).toConstantValue(Config.get("mongo.collection"));
    storageContainer.bind(STORAGE_TYPES.Database).toConstantValue(Config.get("mongo.db"));
    storageContainer.bind(STORAGE_TYPES.StorageTarget).toConstantValue("SECONDLOCK_MONGO_FEDERATION_DATA");
    storageContainer
      .bind(STORAGE_TYPES.SECONDLOCK_REGISTRY_URI)
      .toConstantValue(bootstrapperContainer.get("SECONDLOCK_REGISTRY_URI"));

    this.federationRepro = storageContainer.getTagged<
      PkStorage.IMongoRepository<MsFederation.IFederationStorageObject>
    >(STORAGE_TYPES.IMongoRepository, STORAGE_TYPES.STATE_LESS, false);
  }

  public async create(obj: MsFederation.IFederationStorageObject): Promise<MsFederation.IFederationStorageObject> {
    const createdFederationEntry = obj;
    const objId = await this.federationRepro.create(obj);
    createdFederationEntry._id = objId;
    return createdFederationEntry;
  }

  public async update(id: string, obj: MsFederation.IFederationStorageObject): Promise<boolean> {
    return await this.federationRepro.update<MsFederation.IFederationStorageObject>(id, obj);
  }

  public async search(query: object): Promise<Array<MsFederation.IFederationStorageObject> | null> {
    return await this.federationRepro.find(query);
  }

  public async deleteByDomain(domain: string): Promise<boolean> {
    return await this.federationRepro.deleteMany({ domain });
  }

  public async deleteById(id: string): Promise<boolean> {
    return await this.federationRepro.delete(id);
  }

  public async prune(): Promise<boolean> {
    return await this.federationRepro.deleteMany({});
  }
}
