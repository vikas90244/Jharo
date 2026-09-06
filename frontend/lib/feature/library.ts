import { apiBlob } from "../api";
import { api } from "../api";

export function retreiveResource(id:number){
    return apiBlob(`/resources/${id}/stream`);
}
export interface RetreiveResourcePayload{
    id: number ;
    start:number; 
    end: number;
}
export interface RetreiveResourceResponse{
    pages:Page[];
}
export interface Page{
    id:number;
    page_number: number; 
    width: number; 
    height: number;
    data: Block[];
    resource:number;
}
export type Block = ImageBlock | TextBlock;
export interface ImageBlock {
    type: 1;
    number: number;
    bbox:[number, number ,number , number];
    width:number ;
    height:number; 
    colorspace:number;
    xres:number;
    yres:number;
    bpc:number;
    transform:number[];
    size:number;
    mask?: number | null;
    src: string;
}

export interface TextBlock {
    type:0;
    number:number;
    flags:number;
    bbox:[number ,number, number, number];
    lines:Line[]
}
export interface Line {
    spans:Span[];
    wmode:number;
    dir:[number ,number];
    bbox:[number ,number ,number ,number];

}
export interface Span {
    size: number;
    flags:number;
    bidi:number;
    char_flags:number;
    font:string;
    color:number; 
    alpha:number;
    ascender:number;
    descender:number;
    text: string;
    origin:[number, number];
    bbox:[number ,number ,number, number];

}
export function retreiveResourceRange({id, start, end}:RetreiveResourcePayload){
    return api<Page[]>(`/resources/${id}/pages/?start=${start}&end=${end}`)
}