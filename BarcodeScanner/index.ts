import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { IData } from './IData';
import { Html5Qrcode } from 'html5-qrcode';


interface ICamera {
    id: string;
    label: string;
}

export class BarcodeScanner implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private notifyOutputChanged: () => void;
    private theContainer: HTMLDivElement;
    private returnValue: IData;
    private scanner: Html5Qrcode;
    private cameraState: "INIT" | "SCANNING" | "PAUSED" | "STOPPED";
    private cameraMode: "Back Camera" | "Front Camera";

    constructor() {

    }

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.notifyOutputChanged = notifyOutputChanged;
        this.theContainer = container;
        this.theContainer.id = 'custom-bar-code-scanner-id';
        this.scanner = new Html5Qrcode(this.theContainer.id);
        this.cameraState = "INIT";

    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {

        let rerender = false;
        let changeCamera = false;
        
        if(this.cameraMode != context.parameters.CameraMode.raw){
            this.cameraMode = context.parameters.CameraMode.raw;
            changeCamera = true;
        }
        if(context.parameters.ResetCamera.raw == true){
            rerender = true;
        }

        if(this.cameraState == "INIT" || changeCamera){	
            this.scanner.start(
                {
                    facingMode: this.cameraMode == "Back Camera" ? "environment" : "user"
                },
                {
                    fps: 30,
                    disableFlip: false,
                    qrbox: this.qrboxFunction,
                    aspectRatio: 4/3
                },
                this.onScanSuccess.bind(this),
                (errorMessage) => {
                })
                .catch((err) => {
                    console.log(err);
                }
            );
            this.cameraState = "SCANNING";
        }
        else if(this.cameraState == "PAUSED" && rerender){
            this.clearScannedValue();
            this.cameraState = "SCANNING";
            this.scanner.resume();
            
        }   
    }

    public getOutputs(): IOutputs {
        return {
            Value: this.returnValue.Value,
            BarcodeType: this.returnValue.BarcodeType,
            RawValue: this.returnValue.RawValue
        };
    }

    public destroy(): void {
        this.scanner.stop().then((ignore) => {
        }).catch((err) => {
        });
    }

    private qrboxFunction(viewfinderWidth: any, viewfinderHeight: any) {
        const minEdgePercentage = 0.7;
        const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
            width: qrboxSize,
            height: qrboxSize
        };
    }

    public onScanSuccess(decodedText: any, decodedResult: any) {
        this.cameraState = "PAUSED";
        this.returnValue = {
            Value: decodedText,
            RawValue: decodedResult.result.text,
            BarcodeType: decodedResult.result.format.formatName
        };
        this.scanner.pause();
        this.notifyOutputChanged();
    }

    public clearScannedValue() {
        this.returnValue = {
            Value: '',
            RawValue: '',
            BarcodeType: ''
        };
        this.notifyOutputChanged();
    }
}
