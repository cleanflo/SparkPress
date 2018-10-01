import { TestBed, inject } from '@angular/core/testing';

import { PluginLoaderService } from './plugin-loader.service';

describe('ModuleLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PluginLoaderService]
    });
  });

  it('should be created', inject([PluginLoaderService], (service: PluginLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
