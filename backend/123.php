<?php
class Service {
    public function performAction() {
        return "Какое-то действие.";
    }
}

class Client {
    private $service;

    public function __construct(Service $service) {
        $this->service = $service;
    }

    public function execute() {
        $result = $this->service->performAction();
        echo $result;
    }
}

$serviceInstance = new Service();
$clientInstance = new Client($serviceInstance);
$clientInstance->execute();
?>