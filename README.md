# barcodecustom

A custom barcode component based on the HTML5 qr code scanner library ([https://www.npmjs.com/package/html5-qrcode](https://www.npmjs.com/package/html5-qrcode)). The control can be used in canvas apps.

## Properties
The component has the following input properties:
| Property | Description                |
| :-------- | :------------------------- |
| ResetCamera | A toggle to reset the camera. Could be used to resume scanning codes after the camera successfully scanned a code. |
| OnChange | This can be used to trigger some logic when the scanner successfully scans a code. For an example of how to use this, see below.   |

The component has the following output properties:
| Property | Description                |
| :-------- | :------------------------- |
| Value | The string value that is read from the barcode. |
| BarcodeType | The type of barcode that was scanned.   |

### Handle the OnChange event
To handle the onChange event, you should check if the output property Value is filled and if so, you could perform some action. See the example below:

```
 If(!IsBlank(Self.Value),Navigate(ScannerComplete))
```

## Limitations
This project is a proof of concept and has some limitations.
- The camera defaults to the back camera if available, otherwise it will use the front facing camera. There is currently no way to change this (unless you modify the PCF component).
- The camera width and height cannot be changed easily, the camera will fill the full width, but the height depends on the device type. So it is recommended to have the scanner on a separate page to avoid overlapping UI elements.


## Create your own copy of this component
This repo contains a proof of concept and you are free to create your own version of this component. To do so, you can clone the repo and start developing like you would develop any other PCF component. Microsoft has good [documentation](https://learn.microsoft.com/en-us/power-apps/developer/component-framework/implementing-controls-using-typescript?tabs=before) on how to do this.
