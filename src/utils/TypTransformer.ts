/**
 * 
 * Just used for Typ message transforming (Top and Bottom) 
 * 
 */
export class TypTransformer {
  typ: string;

  constructor(typ: string) {
    this.typ = typ;
  }

  toClassColor(): string {
    var returned: string = 'success';
    switch (this.typ) {
      case 'warning':
        returned = 'warning';
        break;
      case 'error':
        returned = 'error';
        break;
      case 'fatal':
        returned = 'error';
        break;
    }
    return returned;
  }
}

