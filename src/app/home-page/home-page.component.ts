import { Component, OnInit, ViewContainerRef, ViewChild, ComponentRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PluginLoaderService, SparkShortCode, ParagraphComponent } from '../plugin-loader.service';

@Component({
  selector: 'sp-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  public title: string;
  public components: SparkShortCode[] = [];
  private _components: ComponentRef<ParagraphComponent>[];
  public name: string;
  @ViewChild('content', {read: ViewContainerRef}) _content: ViewContainerRef;

  constructor(
    private route: ActivatedRoute,
    private plugins: PluginLoaderService,
  ) { }

  ngOnInit() {
    this.name = this.route.snapshot.data['name'];
    this.title = this.route.snapshot.data['title'];
    const content = this.route.snapshot.data['content'];

    if (content !== null && typeof content !== 'undefined') {
      this.components = this.plugins.generateContent(content);
      this.components.forEach((comp) => {
        const compRef: ComponentRef<ParagraphComponent> = this._content.createComponent(comp.component.factory);
        compRef.instance.components = comp.component.nested;
        this._components.push(compRef);
      });
    }
 }

}
