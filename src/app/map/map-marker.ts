import {LatLngExpression, Marker, MarkerOptions} from 'leaflet';

export class MapMarker extends Marker {
    id: number;

    constructor(id: number, latlng: LatLngExpression, options?: MarkerOptions){
        super(latlng, options);
        this.id = id;
    }
}
