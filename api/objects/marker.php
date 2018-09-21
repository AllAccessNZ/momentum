<?php
class Marker
{

    // database connection and table name
    private $conn;
    private $table_name = "marker";

    // object properties
    public $id;
    public $user_id;
    public $name;
    public $address;
    public $description;
    public $type;
    public $lat;
    public $lng;

    // constructor with $db as database connection
    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read()
    {
        // select all query
        $query = "SELECT * FROM $this->table_name ORDER BY created DESC";

        // prepare query statement
        $stmt = $this->conn->prepare($query);

        // execute query
        $stmt->execute();

        return $stmt;
    }

    public function create()
    {
        // query to insert record
        $query = "INSERT INTO $this->table_name SET
    user_id=:user_id, name=:name, address=:address, description=:description, type=:type, lat=:lat, lng=:lng, created=:created";

// prepare query
        $stmt = $this->conn->prepare($query);

// sanitize
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->lat = htmlspecialchars(strip_tags($this->lat));
        $this->lng = htmlspecialchars(strip_tags($this->lng));
        $this->created = htmlspecialchars(strip_tags($this->created));

// bind values
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":lat", $this->lat);
        $stmt->bindParam(":lng", $this->lng);
        $stmt->bindParam(":created", $this->created);

// execute query
        if ($stmt->execute()) {
            return true;
        }

        return false;
    }
}
