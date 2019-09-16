import { Metadata } from './metadata';
import { Schemas } from './schemas';
import { Info } from './info';
import { OperationGroup } from './operation';
import { Initializer, DeepPartial, enableSourceTracking } from '@azure-tools/codegen';
import { threadId } from 'worker_threads';

/** the model that contains all the information required to generate a service api */
export interface CodeModel extends Metadata {
  /** Code model information */
  info: Info;

  /** All schemas for the model */
  schemas: Schemas;

  /** All operations  */
  operationGroups: Array<OperationGroup>;
}

export class CodeModel extends Metadata implements CodeModel {
  constructor(title: string, sourceTracking = false, objectInitializer?: DeepPartial<CodeModel>) {
    super();
    // if we are enabling source tracking, then we have to use a proxied version of this
    const $this = sourceTracking ? enableSourceTracking(this) : this;

    $this.info = new Info(title);
    $this.schemas = new Schemas();
    $this.operationGroups = [];

    this.applyTo($this, objectInitializer);
  }

  getOperationGroup(group: string) {
    let result = this.operationGroups.find(each => each.$key);
    if (!result) {
      result = new OperationGroup(group);
      this.operationGroups.push(result);
    }
    return result;
  }
}