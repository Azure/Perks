import { fixLeadingNumber, deconstruct, isEqual, removeSequentialDuplicates } from './text-manipulation'
import { Dictionary } from '@azure-tools/linq';

export type Styler = ((identifier: string | string[], removeDuplicates: boolean | undefined, overrides: Dictionary<string> | undefined) => string);

function applyFormat(normalizedContent: Array<string>, overrides: Dictionary<string> = {}, separator: string = '', formatter: (s: string, i: number) => string = (s, i) => s) {
  return normalizedContent.map((each, index) => overrides[each.toLowerCase()] || formatter(each, index)).join(separator);
}

function normalize(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): Array<string> {
  if (!identifier || identifier.length === 0) {
    return [''];
  }
  return typeof identifier === 'string' ? normalize(fixLeadingNumber(deconstruct(identifier))) : removeDuplicates ? removeSequentialDuplicates(identifier) : identifier;
}
export class Style {
  static select(style: any, fallback: Styler): Styler {
    switch (`${style}`.toLowerCase()) {
      case 'camelcase':
      case 'camel':
        return Style.camel;
      case 'pascalcase':
      case 'pascal':
        return Style.pascal;
      case 'snakecase':
      case 'snake':
        return Style.snake;
      case 'uppercase':
      case 'upper':
        return Style.upper;
      case 'kebabcase':
      case 'kebab':
        return Style.kebab;
      case 'spacecase':
      case 'space':
        return Style.space;
    }
    return fallback;
  }

  static kebab(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '-');
  }

  static space(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '');
  }

  static snake(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '_');
  }

  static upper(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '_', each => each.toUpperCase());
  }
  static pascal(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '', each => each.capitalize());
  }

  static camel(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '', (each, index) => index ? each.capitalize() : each.uncapitalize());
  }

}
