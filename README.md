roadtrip
===================
Roadtrip is a script to make movies from Google StreetView images. You can see a live demo at https://lionel.me/experiments/roadtrip/. There is three different tools. If you want to recreate it on your own, this is how you should proceed.

First step: find a cool trip to make a movie. You need to have the lat/lng from your starting point and your destination. If the path is long, think about splitting it into various segments.

DirectionsToLatLng
----------
You have to get your own Google Map API Key. Please replace *YOU_API_KEY* on line 184 by your own.

This tools will get the lat/lng for each location on you path from a Google Map Direction object. Juste enter your starting point, the destination and eventually some waypoints. All these option are entered as a Google Map Route Object.

```json
{
  "origin": "35.219816, -114.008249",
  "destination": "35.331328, -112.900893",
  "waypoints": [
    {
      "location": "35.527762, -113.431055"
    }
  ],
  "travelMode": "DRIVING"
}
```

Then press "Calculate" and you will get a list of lat/lng. One ever 10 meters along your route. Save this to a file named *locations.txt* and place it into the *data* folder of the **StreetViewImageLoader** application.

----------

StreetViewImageLoader
----------
StreetViewImageLoader is a Processing application that simply download every image from locations stored in **locations.txt**. It use Google StreeView API. You have to get your own API Key. Please note you can only download 25'000 images per days. So be patient... or pay.

Sometimes you will get bad images (no image available, wrong lane, bridge crossing error, etc.). Its strongly recommended to check every images, delete the wrong one and the rename the sequence properly.

Site
----------
The site is designed to display the route. The script load one image every 40ms and display it on a canvas, then add some effects. You have 3 different files to configure:

*configuration.json*
This is the main configuration file

```
{
  "max_frames": 344100, //Total frames
  "basedir": "./medias/images/demo",
  "segments_file": "./data/segments.json", //File describing the segments
  "places_file": "./data/places.json", //File describing the places
  "audio": ["./medias/music/intro.mp3", "./medias/music/loop.mp3"] //Audio files played in background
}
```

*segments.json*
This file describe the segments you have in your route. Each segment is a series of images numbered from 0 stored in a separate folder.

```
[
  {
    "folder_name": "01-Yvd-Vlb",
    "count": 2422
  }, {
    "folder_name": "02-Vlb-Vdj",
    "count": 2295
  }
]
```

*places.json*
This file describe the places you encounter in your route (displayed in the bottom nav bar of the site). A place can be a point or an area.

You have to specify the start frame (points and areas) and the end frame (areas only). You can either enter the raw number of the frame of ID of a segment (frame number will be computed automatically).

```
{
  "points": [
    {
      "name": "Yverdon", // Place name
      "start_segment": 0 //ID of the segment where the point is
    },
    {
      "name": "Vallorbe", //Place name
      "start": 2300 //Frame number of the point (relative to the whole route)
    }
  ],
  "areas": [
    {
      "name": "Plain de l'Orbe", //Area name
      "start": 450, //Start frame number of the area (relative to the whole route)
      "end": 1100 //End frame number of the area (relative to the whole route)
    },
    {
      "name": "Vallée de Joux",
      "start_segment": 1,  //ID of the segment where the area start
      "end": 4717 //End frame number of the area (relative to the whole route)
    }
  ]   
}
```

License
----------
MIT
