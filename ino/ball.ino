#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>

const char* ssid = ""; // WIFI name
const char* password = ""; //WIFI password

ESP8266WebServer server(80);

byte d5 = 14;
byte d6 = 12;
byte d7 = 13;
byte d8 = 15;

bool LEDstatus = LOW;

String direction = "";

void setup() {
  Serial.begin(9600);
  delay(100);
  pinMode(D4, OUTPUT);
  pinMode(d5,OUTPUT);
  pinMode(d6,OUTPUT);
  pinMode(d7,OUTPUT);
  pinMode(d8,OUTPUT);

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
  digitalWrite(D4, !LEDstatus);
}

void loop() {
  server.handleClient();

  move();
}

String sendJson(DynamicJsonDocument& data) {
  String json;
  serializeJson(data, json);
  return json;
}

void move(){
  if (direction == "") {
    digitalWrite(d5, 0);
    digitalWrite(d6, 0);
    digitalWrite(d7, 0);
    digitalWrite(d8, 0);
  } else if (direction == "right") {
    digitalWrite(d5, 0);
    digitalWrite(d6, 1);
    digitalWrite(d7, 0);
    digitalWrite(d8, 1);
  } else if (direction == "left") {
    digitalWrite(d5, 1);
    digitalWrite(d6, 0);
    digitalWrite(d7, 1);
    digitalWrite(d8, 0);
  } else if (direction == "forward") {
    digitalWrite(d5, 0);
    digitalWrite(d6, 1);
    digitalWrite(d7, 1);
    digitalWrite(d8, 0);
  } else if (direction == "backward") {
    digitalWrite(d5, 1);
    digitalWrite(d6, 0);
    digitalWrite(d7, 0);
    digitalWrite(d8, 1);
  } else {
    digitalWrite(d5, 0);
    digitalWrite(d6, 0);
    digitalWrite(d7, 0);
    digitalWrite(d8, 0);
  }
}


void routes(){
  server.on("/", route_main);
  server.on("/move-right", route_move_right);
  server.on("/move-left", route_move_left);
  server.on("/move-forward", route_move_forward);
  server.on("/move-backward", route_move_backward);
  server.on("/brake", route_brake);
  server.onNotFound(route_main); // If route not found
}


void route_move_right() {
  direction = "right";
  Serial.println("direction: " + direction);

  DynamicJsonDocument response(200);

  response["success"] = true;

  server.send(200, "application/json", sendJson(response));
}
void route_move_left() {
  direction = "left";
  Serial.println("direction: " + direction);

  DynamicJsonDocument response(200);

  response["success"] = true;

  server.send(200, "application/json", sendJson(response));
}
void route_move_forward() {
  direction = "forward";
  Serial.println("direction: " + direction);

  DynamicJsonDocument response(200);

  response["success"] = true;

  server.send(200, "application/json", sendJson(response));
}
void route_move_backward() {
  direction = "backward";
  Serial.println("direction: " + direction);

  DynamicJsonDocument response(200);

  response["success"] = true;

  server.send(200, "application/json", sendJson(response));
}
void route_brake() {
  direction = "";
  Serial.println("direction: Brake");

  DynamicJsonDocument response(200);

  response["success"] = true;

  server.send(200, "application/json", sendJson(response));
}

void route_main(){
  server.send(200, "text/html", render_main_page());
}

String render_main_page(){
  // ?" + String(random(100000, 1000000)) + "
  String html = "<!DOCTYPE html><html lang=\"en\"><head><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta charset=\"UTF-8\"><title>Title</title><link rel=\"stylesheet\" href=\"http://ball.infinitycloud.ru/public/css/loader.css?" + String(random(100000, 1000000)) + "\"></head><body><div id=\"page-loader-wrapper\"><div class=\"loader\"></div></div><main id=\"app\"></main><script src=\"http://ball.infinitycloud.ru/public/js/app.js?" + String(random(100000, 1000000)) + "\"></script></body></html>";
  
  return html;
}