#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>

const char* ssid = ""; // WIFI name
const char* password = ""; //WIFI password

ESP8266WebServer server(80);


bool LEDstatus = LOW;

void setup() {
  Serial.begin(9600);
  delay(100);
  pinMode(D4, OUTPUT);

  Serial.println("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    digitalWrite(D4, !LEDstatus);
    Serial.print(".");

    LEDstatus = !LEDstatus;
  }
  Serial.println("");
  Serial.println("WiFi connected..!");
  Serial.print("Got IP: ");
  Serial.println(WiFi.localIP());
  digitalWrite(D4, !LOW);

  routes();

  server.begin();
  Serial.println("HTTP Server Started");

  delay(1200);

  LEDstatus = HIGH;
  digitalWrite(D4, !LOW);
  delay(500);
  digitalWrite(D4, !LEDstatus); //After connecting should be glow

  // Light-emitting diode flashing and connecting to WIFI
}

void loop() {
  server.handleClient();

}

String sendJson(DynamicJsonDocument& data) {
  String json;
  serializeJson(data, json);
  return json;
}

void routes(){
  server.on("/", route_main); //Front page (Controller)
  server.onNotFound(route_main); // If route not found

  server.on("/ajax", route_ajax); // Asynchronous Javascript and XML

}


void route_ajax() {
  // change variable values and do something

  response["success"] = false;

  int statusCode = 403;

  if(server.hasArg("cups") && server.hasArg('drinks')){

        //drink = server.arg("drink") //for eg 3,1,2

        //logic here

        statusCode = 200

        response["success"] = true;
  }

  DynamicJsonDocument response(statusCode);

  server.send(statusCode, "application/json", sendJson(response));
}


void route_main(){
  server.send(200, "text/html", render_main_page());
}

String render_main_page(){
  // ?" + String(random(100000, 1000000)) + "
  String html = "<!DOCTYPE html><html lang=\"en\"><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta charset=\"UTF-8\"><title>Title</title><link rel=\"stylesheet\" href=\"http://ball.infinitycloud.ru/public/css/loader.css?" + String(random(100000, 1000000)) + "\"></head><body><div id=\"page-loader-wrapper\"><div class=\"loader\"></div></div><main id=\"app\"></main><script src=\"http://ball.infinitycloud.ru/public/js/app.js?" + String(random(100000, 1000000)) + "\"></script></body></html>";
  
  return html;
}