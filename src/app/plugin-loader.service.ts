import {
  Injectable,
  Component,
  OnInit,
  SystemJsNgModuleLoader,
  Compiler,
  Injector,
  ComponentFactory,
  ComponentFactoryResolver,
  ViewChild,
  ViewContainerRef,
  ComponentRef
} from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentSnapshot } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

declare const SystemJS;

@Injectable({
  providedIn: 'root'
})
export class PluginLoaderService {

  private pluginsCollection: AngularFirestoreCollection<SparkPlugin>;
  private pluginsObs: Observable<SparkPlugin[]>;
  private plugins: SparkPlugin[] = [];

  private themeDocument: AngularFirestoreDocument<SparkTheme>;
  private themeObs: Observable<SparkTheme>;

  private userDoc: SparkUser;

  constructor(
    // private loader: SystemJsNgModuleLoader,
    private compiler: Compiler,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  private loadActive(active: boolean) {
    this.pluginsCollection = this.afs.collection('plugins',
        ref => {
          let query = ref.orderBy('name', 'asc');
          if (active) {
            query = query.where('active', '==', true);
          }
          return query;
        });
      this.pluginsObs = this.pluginsCollection.valueChanges();
      this.pluginsObs.pipe(take(1)).subscribe(plugins => {
        for (let i = 0; i < plugins.length; i++) {
          this.moduleLoader(plugins[i]);
        }
      });
  }

  loadPlugins() {
    /*
      get list of active plugins from node in firestore
      load module from path
      use 'registered' short-codes to replace content in html
      if plugin has admin page, make available in admin sidebar
    */
    if (this.afAuth.auth.currentUser === null) {
      this.loadActive(true);
    } else {
      this.afs.collection('users').doc(this.afAuth.auth.currentUser.uid)
        .get().pipe(take(1))
        .subscribe((userDoc: DocumentSnapshot<SparkUser>) => {
          this.userDoc = userDoc.data();
          const role = this.userDoc.role;
          if (role === 'admin' || role === 'super-admin') {
            this.loadActive(false);
          } else {
            this.loadActive(true);
          }
        });
    }
  }

  loadTheme() {
    /*
      get theme info from node in firestore
      load module from path
    */
    this.themeDocument = this.afs.doc('theme');
    this.themeObs = this.themeDocument.valueChanges();
    this.themeObs.pipe(take(1)).subscribe((theme) => {
      // this.moduleLoader(theme);
    });
  }

  private moduleLoader(module: SparkPlugin) {
    SystemJS.import(module.url)
      .then((sysModule) => {
        const modFactory = this.compiler.compileModuleSync<any>(sysModule.default);
        const modRef = modFactory.create(this.injector);
        const plugins = modRef.injector.get('plugins');
        const resolver = modRef.componentFactoryResolver;

        for (let i = 0; i < plugins[0].length; i++) {
          const componentFactory = resolver.resolveComponentFactory(plugins[0][i].component);
          const component = <SparkPluginComponent>{
            base: plugins[0][i],
            factory: componentFactory,
          };
          module.shortcodes.forEach((sc, sci, sca) => {
            if (sc.html_selector === componentFactory.selector) {
              sca[sci].component = component;
            }
          });
        }
    });

    // this.loader.load(module.url)
    // .then ((modFac) => {

    //   const modFactory = this.compiler.compileModuleSync<any>(modFac.moduleType);
    //   const modRef = modFactory.create(this.injector);
    //   const widgets = modRef.injector.get('widgets');
    //   const resolver = modRef.componentFactoryResolver;
    //   const componentFactory = resolver.resolveComponentFactory(widgets[0][0].component);
    //   module.factory = componentFactory;
    //   // this.vc.createComponent(componentFactory);

    //   // this.compiler.compileModuleAndAllComponentsAsync<any>(modFac.moduleType)
    //   // .then((factory) => {
    //   //     let cmpFactory: ComponentFactory<any>;

    //   //     for (let i = factory.componentFactories.length - 1; i >= 0; i--) {
    //   //         if (factory.componentFactories[i].componentType.name === module.init_component) {
    //   //             cmpFactory = factory.componentFactories[i];
    //   //         }
    //   //     }
    //   //     return cmpFactory;
    //   //   });
    // });
  }

  // based on stackoverflow answer https://stackoverflow.com/a/46964058
  private parseShortCodes(content: string): {id: string, attrs: Map<string, any>}[] {
    const regex = /\[\S+(?:\s+[^="]+="[^"\]\s]+")+\]/g;
    const result: {id: string, attrs: Map<string, any>}[] = [];
    let val: RegExpExecArray;

    while ((val = regex.exec(content)) !== null) {
      if (val.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      const attrs = val[0].slice(1, -1).split(/\s+/);

      const id: string = attrs.shift();
      const pairs: Map<string, any> = new Map();

      attrs.forEach((attr) => {
        const pair = attr.split('=');
        pairs.set(pair[0], pair[1]);
      });

      result.push({
        id: id,
        attrs: pairs
      });
    }

    return result;
  }

  generateContent(content: string): SparkShortCode[] {
    const result: SparkShortCode[] = [];
    let nested: SparkShortCode[] = [];
    const paragraphs = content.split('\n');

    // find occurance of shortcode with specified attributes
    const shortCodes = this.parseShortCodes(content);
    for ( let i = shortCodes.length; i > 0; i--) {
      const sc = shortCodes[i];
      if (sc.hasOwnProperty('id') && sc.hasOwnProperty('attrs')) {
        // generate shortcode string as it exists in the content
        let str = '[' + sc.id;
        sc.attrs.forEach((v, k) => {
          str += ' ' + k + '=' + v;
        });
        str += ']';

        // get the shortcode from the first plugin that has it
        let shortcode: SparkShortCode;
PLUGINS:
        for (let j = 0; j < this.plugins.length; j++) {
          const p = this.plugins[j];
          for (let k = 0; k < p.shortcodes.length; k++) {
            const s = p.shortcodes[k];
            if (s.short_code === sc.id) {
              shortcode = s;
              break PLUGINS;
            }
          }
        }

        if (shortcode !== null && typeof shortcode !== 'undefined') {
          // fill the attributes of the shortcode
          if (shortcode.attrs !== null && typeof shortcode.attrs !== 'undefined' && shortcode.attrs.length) {
            for (let j = 0; j < shortcode.attrs.length; j++) {
              sc.attrs.forEach((attr, key) => {
                if (shortcode.attrs[j].name === key) {
                  shortcode.attrs[j].val = attr;
                }
              });
            }
          }

          let spans: string[] = [];
          let ip = paragraphs.length;
PARAGRAPHS:
          while (ip--) {
            if (paragraphs[ip].includes(str)) {
              spans = paragraphs[ip].split(str);
              paragraphs[ip] = spans[0];

              const spanShortCode = <SparkShortCode>{
                type: 'html',
                name: 'span',
                html_selector: 'span',
                attrs: [],
                component: {
                  type: 'span',
                  content: spans[1]
                }
              };
              nested.unshift(shortcode, spanShortCode);
              break PARAGRAPHS;
            } else {
              const spanShortCode = <SparkShortCode>{
                type: 'html',
                name: 'span',
                html_selector: 'span',
                attrs: [],
                component: {
                  type: 'span',
                  content: paragraphs[ip]
                }
              };
              nested.unshift(spanShortCode);
              paragraphs.splice(ip, 1);

              const paraFactory = this.resolver.resolveComponentFactory(ParagraphComponent);
              const paraShortCode = <SparkShortCode>{
                type: 'html',
                name: 'p',
                html_selector: 'p',
                attrs: [],
                component: {
                  type: 'p',
                  factory: paraFactory,
                  nested: nested
                }
              };

              result.unshift(paraShortCode);
              nested = [];
              continue PARAGRAPHS;
            } // parahraph includes shortcode string
          } // forEach paragraph: PARAGRAPHS
        } // SparkShortCode !== null
      } // if sc hasownProperty('id') && ('attrs')
    } // forEach shortcode

    return result;
  }

  // private generateHtmlForShortcode(shortcode: SparkShortCode): string {
  //   let elem = shortcode.html_selector;
  //   if (elem === null || typeof elem === 'undefined' || elem === '') {
  //     elem = shortcode.short_code;
  //   }

  //   let html = '<' + elem;
  //   shortcode.attrs.forEach(attr => {
  //     html += ' ' + attr.name + '=' + attr.val.toString();
  //   });
  //   html += '>';

  //   if (shortcode.html_close) {
  //     html += '</' + elem + '>';
  //   }

  //   return html;
  // }
}


@Component({
  selector: 'sp-paragraph',
  template: `<p #content></p>`,
  styles: [``]
})
export class ParagraphComponent implements OnInit {
  public components: SparkShortCode[] = [];
  private _components: ComponentRef<any>[] = [];
  @ViewChild('content', {read: ViewContainerRef}) _content: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
  }

  insertComponents() {
    this.components.forEach((comp) => {
      if (comp.component.type === 'span') {
        const factory = this.resolver.resolveComponentFactory(SpanComponent);
        const compRef = this._content.createComponent(factory);
        compRef.instance.content = comp.component.content;
        this._components.push(compRef);
      } else {
        const compRef = this._content.createComponent(comp.component.factory);
        comp.component.attrs.forEach((attr) => {
          if (compRef.instance.hasOwnProperty(attr.name)) {
            compRef.instance[attr.name] = attr.val;
          }
        });
        this._components.push(compRef);
      }
    });
  }
}

@Component({
  selector: 'sp-span',
  template: `<span>{{ content }}</span>`,
  styles: [``]
})
export class SpanComponent {
  public content: string;

  constructor() {
  }
}


export interface SparkContent {
  shortcodes: SparkShortCode[];
}

export interface SparkUser {
  name: string;
  role: 'super-admin' | 'admin' | 'subscriber';
  last_login: Date;
  created: Date;
  active: boolean;
  blocked: boolean;
}

export interface SparkPlugin {
  name: string;
  url: string;
  checksum: string;
  shortcodes: SparkShortCode[];
}

export interface SparkShortCode {
  name: string;
  type: 'html' | 'store' | '';
  short_code: string;
  html_selector: string;
  attrs: SparkShortCodeAttr[];
  component: SparkPluginComponent;
}

export interface SparkShortCodeAttr {
  name: string;
  val: any;
}

export interface SparkPluginComponent {
  type: string;
  content: string;
  nested: SparkShortCode[];
  attrs: SparkShortCodeAttr[];
  base: any;
  factory: any;
}

export interface SparkTheme {
  name: string;
  url: string;
  checksum: string;
  factory: any;
}


