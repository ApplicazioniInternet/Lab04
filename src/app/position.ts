export class Position {
    id: number;
    latitude: number;
    longitude: number;
    timestamp:number;

    constructor (id:number, latitude:number, longitude:number, timestamp:number){
        this.id=id;
        this.latitude=latitude;
        this.longitude=longitude;
        this.timestamp=timestamp;
    }
}
