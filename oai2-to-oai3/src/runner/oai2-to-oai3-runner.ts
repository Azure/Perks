import { DataHandle } from "@azure-tools/datastore";
import { Oai2ToOai3 } from "../converter";
import { CrossFileReferenceTracker, ReferenceEntry } from "./reference-tracker";
import { loadInputFiles } from "./utils";

export interface OaiToOai3FileInput {
  name: string;
  schema: any; // OAI2 type?
}

export interface OaiToOai3FileOutput {
  name: string;
  result: any; // OAI2 type?
}

export const convertOai2ToOai3Files = async (inputFiles: DataHandle[]): Promise<OaiToOai3FileOutput[]> => {
  const files = await loadInputFiles(inputFiles);
  const map = new Map<string, OaiToOai3FileInput>();
  for (const file of files) {
    map.set(file.name, file);
  }
  console.error("Converting files", [...map.keys()]);
  return convertOai2ToOai3(map);
};
 
export const convertOai2ToOai3 = async (inputs: Map<string, OaiToOai3FileInput>): Promise<OaiToOai3FileOutput[]> => {
  const referenceTracker = new CrossFileReferenceTracker([...inputs.keys()]);
  const resolvingFiles = new Set<string>();
  const completedFiles = new Map<string, OaiToOai3FileOutput>();

  const resolveReference: ResolveReferenceFn = async (
    targetfile: string,
    reference: string,
  ): Promise<ReferenceEntry | undefined> => {
    const tracker = referenceTracker.getForFile(targetfile);
    const file = inputs.get(targetfile);
    if (file === undefined || tracker === undefined) {
      throw new Error(`Ref file ${targetfile} doesn't exists.`);
    }

    if (!completedFiles.has(targetfile)) {
      await computeFile(file);
    }
    return tracker.getReference(reference);
  };

  const computeFile = async (input: OaiToOai3FileInput) => {
    if (resolvingFiles.has(input.name)) {
      // Todo better circular dep findings
      throw new Error(`Circular dependency with file ${input.name}`);
    }
    resolvingFiles.add(input.name);
    console.error("Resolving file", input.name);

    const addMapping: AddMappingFn = (oldRef: string, newRef: string, referencedEl: any) => {
      const tracker = referenceTracker.getForFile(input.name);
      if (tracker === undefined) {
        throw new Error(`Unexpected error, this should never have happened.`);
      }
      tracker.addReference(oldRef, newRef, referencedEl);
    };
    const result = await convertOai2ToOai3Schema(input, addMapping, resolveReference);
    completedFiles.set(input.name, {
      result,
      name: input.name,
    });
    return result;
  };
   
  for (const input of inputs.values()) {
    if (completedFiles.has(input.name)) {
      continue;
    }
    await computeFile(input);
  } 
  return [...completedFiles.values()];
};

/**
 * Callback to resolve a reference.
 */
export type AddMappingFn = (oldRef: string, newRef: string, referencedEl: any) => void;
export type ResolveReferenceFn = (targetfile: string, reference: string) => Promise<ReferenceEntry | undefined>;

export const convertOai2ToOai3Schema = async (
  { name, schema }: OaiToOai3FileInput,
  addMapping: AddMappingFn,
  resolveReference: ResolveReferenceFn,
): Promise<any> => {
  const converter = new Oai2ToOai3(name, schema, addMapping, resolveReference);
  await converter.convert();
  return converter.generated;
};
