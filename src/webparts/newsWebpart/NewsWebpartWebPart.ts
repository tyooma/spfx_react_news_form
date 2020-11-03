import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';

import * as strings from 'NewsWebpartWebPartStrings';
import { NewsWebpart } from './components/NewsWebpart';
import { INewsWebpartProps } from './components/INewsWebpartProps';

import PnPTelemetry from "@pnp/telemetry-js";
import { setup as pnpSetup } from "@pnp/common";

import { PropertyFieldPeoplePicker, PrincipalType } from '@pnp/spfx-property-controls/lib/PropertyFieldPeoplePicker';
import { IPropertyFieldGroupOrPerson } from "@pnp/spfx-property-controls/lib/PropertyFieldPeoplePicker";
import { IDateTimeFieldValue } from "@pnp/spfx-property-controls/lib/PropertyFieldDateTimePicker";
import { PropertyFieldDateTimePicker, DateConvention } from '@pnp/spfx-property-controls/lib/PropertyFieldDateTimePicker';

export interface INewsWebpartWebPartProps {
  description: string;
  context: WebPartContext;
  isVisible: boolean;
  datetime: IDateTimeFieldValue;
  people: IPropertyFieldGroupOrPerson[];
}

const telemetry = PnPTelemetry.getInstance();
telemetry.optOut();

export default class NewsWebpartWebPart extends BaseClientSideWebPart<INewsWebpartWebPartProps> {

  protected onInit(): Promise<void> {
    return super.onInit().then(_ => {
      pnpSetup({
        spfxContext: this.context
      });
    });
  }

  public render(): void {
    const element: React.ReactElement<INewsWebpartProps> = React.createElement(
      NewsWebpart,
      {
        description: this.properties.description,
        context: this.context,
        isVisible: this.properties.isVisible,
        date: this.properties.datetime,
        user: this.properties.people,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneToggle('isVisible', {
                  label: 'Show non-visible',
                  key: 'Show non-visible',
                  checked: true,
                }),
                PropertyFieldDateTimePicker('datetime', {
                  label: 'Select the date',
                  initialDate: this.properties.datetime,
                  dateConvention: DateConvention.Date,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'dateTimeFieldId',
                  showLabels: false
                }),
                PropertyFieldPeoplePicker('people', {
                  label: 'Assigned Person',
                  initialData: this.properties.people,
                  allowDuplicate: false,
                  multiSelect: false,
                  principalType: [PrincipalType.Users, PrincipalType.SharePoint, PrincipalType.Security],
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  context: this.context,
                  properties: this.properties,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'peopleFieldId'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
