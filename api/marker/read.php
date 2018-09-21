<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// include database and object files
include_once '../config/database.php';
include_once '../objects/marker.php';

// instantiate database and marker object
$database = new Database();
$db = $database->getConnection();

// initialize object
$marker = new Marker($db);

// query markers
$stmt = $marker->read();
$num = $stmt->rowCount();

// check if more than 0 record found
if ($num > 0) {

    // markers array
    $markers_arr = array();
    $markers_arr["records"] = array();

    // retrieve our table contents
    // fetch() is faster than fetchAll()
    // http://stackoverflow.com/questions/2770630/pdofetchall-vs-pdofetch-in-a-loop
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // extract row
        // this will make $row['name'] to
        // just $name only
        extract($row);

        $marker_item = array(
            "id" => $id,
            "user_id" => $user_id,
            "name" => $name,
            "address" => $address,
            "description" => html_entity_decode($description),
            "type" => $type,
            "lat" => $lat,
            "lng" => $lng,
        );

        array_push($markers_arr["records"], $marker_item);
    }

    echo json_encode($markers_arr);
} else {
    echo json_encode(
        array("message" => "No markers found.")
    );
}
