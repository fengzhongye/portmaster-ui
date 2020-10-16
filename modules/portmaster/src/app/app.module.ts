import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { MarkdownModule } from 'ngx-markdown';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DebugComponent } from './debug/debug-panel';
import { NotificationFactoryComponent } from './debug/notification-factory/notification-factory';
import { PortapiInspectorComponent } from './debug/portapi-inspector/portapi-inspector';
import { NavigationComponent } from './layout/navigation/navigation';
import { SideDashComponent } from './layout/side-dash/side-dash';
import { MonitorApplicationViewComponent, MonitorPageComponent, NetworkOverviewComponent } from './pages/monitor';
import { SettingsComponent } from './pages/settings/settings';
import { WidgetSettingsOutletComponent } from './pages/widget-settings-outlet/widget-settings-outlet';
import { AccordionComponent, AccordionGroupComponent } from './shared/accordion';
import { BasicSettingComponent } from './shared/config/basic-setting/basic-setting';
import { FilterListComponent } from './shared/config/filter-list/filter-list';
import { FilterListItemComponent } from './shared/config/filter-list/list-item';
import { GenericSettingComponent } from './shared/config/generic-setting/generic-setting';
import { SecuritySettingComponent } from './shared/config/security-setting/security-setting';
import { ConnectionsViewComponent } from './shared/connections-view/connections-view';
import { CountIndicatorComponent } from './shared/count-indicator/count-indicator';
import { CountryFlagDirective } from './shared/country-flag/country-flag';
import { DropdownComponent } from './shared/dropdown/dropdown';
import { DropDownItemComponent, DropDownValueDirective } from './shared/dropdown/item';
import { ExpertiseDirective } from './shared/expertise/expertise-directive';
import { ExpertiseComponent } from './shared/expertise/expertise-switch';
import { FuzzySearchPipe } from './shared/fuzzySearch';
import { NotificationComponent } from './shared/notification/notification';
import { SafePipe } from './shared/save.pipe';
import { PlaceholderComponent } from './shared/text-placeholder';
import { ToggleSwitchComponent } from './shared/toggle-switch/toggle-switch';
import { MarkdownWidgetComponent, MarkdownWidgetSettingsComponent } from './widgets/markdown-widget';
import { NotificationWidgetComponent, NotificationWidgetSettingsComponent } from './widgets/notification-widget';
import { PilotWidgetComponent } from './widgets/pilot-widget';
import { StatusWidgetComponent, StatusWidgetSettingsComponent } from './widgets/status-widget';
import { WIDGET_DEFINTIONS } from './widgets/widget.types';

@NgModule({
  declarations: [
    AppComponent,
    NotificationComponent,
    DebugComponent,
    AccordionComponent,
    AccordionGroupComponent,
    NotificationFactoryComponent,
    PortapiInspectorComponent,
    BasicSettingComponent,
    GenericSettingComponent,
    SecuritySettingComponent,
    SettingsComponent,
    MonitorPageComponent,
    SideDashComponent,
    NavigationComponent,
    ExpertiseComponent,
    ExpertiseDirective,
    DropdownComponent,
    ConnectionsViewComponent,
    DropDownItemComponent,
    DropDownValueDirective,
    WidgetSettingsOutletComponent,
    StatusWidgetComponent,
    StatusWidgetSettingsComponent,
    ToggleSwitchComponent,
    FilterListComponent,
    FilterListItemComponent,
    PilotWidgetComponent,
    StatusWidgetComponent,
    StatusWidgetSettingsComponent,
    MarkdownWidgetSettingsComponent,
    MarkdownWidgetComponent,
    NotificationWidgetSettingsComponent,
    NotificationWidgetComponent,
    FuzzySearchPipe,
    SafePipe,
    MonitorApplicationViewComponent,
    CountIndicatorComponent,
    CountryFlagDirective,
    PlaceholderComponent,
    NetworkOverviewComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    FontAwesomeModule,
    OverlayModule,
    PortalModule,
    CdkTableModule,
    DragDropModule,
    MarkdownModule.forRoot(),
  ],
  providers: [
    {
      provide: WIDGET_DEFINTIONS,
      useValue: {
        type: 'status-widget',
        name: 'Demo',
        settingsComponent: StatusWidgetSettingsComponent,
        widgetComponent: StatusWidgetComponent,
      },
      multi: true,
    },
    {
      provide: WIDGET_DEFINTIONS,
      useValue: {
        type: 'markdown-widget',
        name: 'Markdown',
        settingsComponent: MarkdownWidgetSettingsComponent,
        widgetComponent: MarkdownWidgetComponent,
      },
      multi: true,
    },
    {
      provide: WIDGET_DEFINTIONS,
      useValue: {
        type: 'pilot-widget',
        name: 'Pilot',
        widgetComponent: PilotWidgetComponent,
        disableCustom: true,
      },
      multi: true,
    },
    {
      provide: WIDGET_DEFINTIONS,
      useValue: {
        type: 'notification-widget',
        name: 'Notifications',
        widgetComponent: NotificationWidgetComponent,
        settingsComponent: NotificationWidgetSettingsComponent,
      },
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
