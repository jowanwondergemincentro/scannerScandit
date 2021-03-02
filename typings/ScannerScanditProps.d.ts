/**
 * This file was generated from ScannerScandit.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { ActionValue, EditableValue } from "mendix";

export interface ScannerScanditProps<Style> {
    name: string;
    style: Style[];
    value?: EditableValue<string | BigJs.Big>;
    onDetect?: ActionValue;
    licensekey?: EditableValue<string>;
}

export interface ScannerScanditPreviewProps {
    class: string;
    style: string;
    value: string;
    onDetect: {} | null;
    licensekey: string;
}
