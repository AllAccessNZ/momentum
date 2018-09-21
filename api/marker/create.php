<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
 
// get database connection
include_once '../config/database.php';
 
// instantiate marker object
include_once '../objects/marker.php';
 
$database = new Database();
$db = $database->getConnection();
 
$marker = new Marker($db);
 
// get posted data
$data = json_decode(file_get_contents("php://input"));
 
// set marker property values
$marker->user_id = $data->user_id;
$marker->name = $data->name;
$marker->address = $data->address;
$marker->description = $data->description;
$marker->type = $data->type;
$marker->lat = $data->lat;
$marker->lng = $data->lng;
$marker->created = date('Y-m-d H:i:s');
 
// create the marker
if($marker->create()){
    echo '{';
        echo '"message": "Marker was created."';
    echo '}';
}
 
// if unable to create the marker, tell the user
else{
    echo '{';
        echo '"message": "Unable to create marker."';
    echo '}';
}
?>