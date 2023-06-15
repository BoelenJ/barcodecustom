import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { IData } from './IData';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import { dataSchema, dataExample  } from "./dataschema";


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
    private cameraList: ICamera[];
    private selectedCameraId: string | undefined;
    private height: number;
    private width: number;
    private availableCameras: typeof dataExample = {
        Cameras: []
    };


    constructor() {

    }

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.notifyOutputChanged = notifyOutputChanged;
        this.theContainer = container;
        this.theContainer.id = 'custom-bar-code-scanner-id';
        this.cameraState = "INIT";
        const height = context.mode.allocatedHeight;
        const width = context.mode.allocatedWidth;
        this.height = height;
        this.width = width;
        this.theContainer.style.height = height + "px";
        this.theContainer.style.width = width + "px";

        // Get cameras and store in variable, init scanner.
        Html5Qrcode.getCameras().then((cameras: ICamera[]) => {
            this.cameraList = cameras;
            console.log(this.cameraList);
            this.availableCameras.Cameras = this.cameraList.map((camera) => {return {Key: camera.id, Value: camera.label}});
            this.scanner = new Html5Qrcode(this.theContainer.id)
            this.clearScannedValue();
        })

    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {

        context.mode.trackContainerResize(true);
        let reset = false;
        let resume = false;

        // If no scanner initialized yet, return
        if(!this.scanner) return;

        // Get cameraId from input
        const cameraId = context.parameters.CameraId.raw != null ? context.parameters.CameraId.raw : undefined;

        if(this.selectedCameraId != cameraId && cameraId != undefined){
            this.selectedCameraId = cameraId;
            reset = true;
        }

        // Get width and height of the container
        const height = context.mode.allocatedHeight;
        const width = context.mode.allocatedWidth;

        if(this.height != height || this.width != width && (width > 80 && height > 80)){
            this.height = height;
            this.width = width;
            reset = true;
        }
        
        // If cameralist is filled and camera needs to be initialized, initialize camera.
        if(this.selectedCameraId != null && this.selectedCameraId != "val" && this.selectedCameraId != undefined && this.cameraState == "INIT"){
            this.startCamera();
        }

        // Reset camera in case of changes.
        if(reset && this.cameraState == "SCANNING"){
            this.stopCamera();
            this.theContainer.style.height = height + "px";
            this.theContainer.style.width = width + "px";
            this.scanner = new Html5Qrcode(this.theContainer.id)
            this.startCamera();
        }

        // Resume camera if necessary.
        if(context.parameters.ResetCamera.raw == true){
            resume = true;
        }
        if(this.cameraState == "PAUSED" && resume){
            this.clearScannedValue();
            this.cameraState = "SCANNING";
            this.scanner.resume();
        }   
    }
    public getOutputs(): IOutputs {
        console.log("getOutputs");
        console.log(this.availableCameras);
        return {
            Value: this.returnValue.Value,
            BarcodeType: this.returnValue.BarcodeType,
            RawValue: this.returnValue.RawValue,
            AvailableCameras: this.availableCameras
        };
    }

    public destroy(): void {
        this.scanner.stop().then((ignore) => {
        }).catch((err) => {
        });
    }

    public async getOutputSchema(context: ComponentFramework.Context<IInputs>): Promise<Record<string, unknown>> { 
        
        console.log("getOutputSchema");
        console.log(dataSchema);
        return Promise.resolve({
            AvailableCameras: dataSchema
        })
    }

    private startCamera(){
        this.scanner.start(
            {
                deviceId: this.selectedCameraId
            },
            {
                fps: 30,
                disableFlip: false,
                qrbox: this.qrboxFunction,
                aspectRatio: 1
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

    private stopCamera(){
        
        this.scanner.stop().then((ignore) => {
        }).catch((err) => {
        });
        this.cameraState = "STOPPED";
    }


    private qrboxFunction(viewfinderWidth: any, viewfinderHeight: any) {
        return {
            width: viewfinderWidth * 0.8,
            height: viewfinderHeight * 0.8
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
