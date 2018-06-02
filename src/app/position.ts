export class Position {
    id: number = undefined;
    latitude: number = undefined;
    longitude: number = undefined;
    timestamp: number = undefined;

    constructor (id?: number, latitude?: number, longitude?: number, timestamp?: number) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
    }
}
