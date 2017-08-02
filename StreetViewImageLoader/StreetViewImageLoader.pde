int current_image = 0;

String locations[];

void setup() {
  size(640, 640);

  locations = loadStrings("locations.txt");

  println("There is " + locations.length + " images to load");
}

void draw() {
  if (current_image < locations.length) {
    loadImageFromStreetView();
    saveFrame("images/"+current_image+".jpg");

    current_image++;
    println(current_image + "/" + locations.length);
  } else {
    fill(0);
    rect(0, 0, width, height);
  }
}

void loadImageFromStreetView() {
  String image_data[] = locations[current_image].split(",");

  try {
    String API_KEY = "AIzaSyCduSaCAbc59uIdEX-g9RvM2iv3CnFpeAY";
    //String API_KEY = "[YOUR GOOGLE STREETVIEW API KEY]";
    
    PImage streeview_image = loadImage("https://maps.googleapis.com/maps/api/streetview?size=1280x1280&location="+image_data[0]+","+image_data[1]+"&heading="+image_data[2]+"&pitch=-0.76&key="+API_KEY, "JPG");
    
    image(streeview_image, 0, 0);
  } catch (Exception e) {
    fill(255,0,0);
    rect(0, 0, width, height);
  }
}