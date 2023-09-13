# K6 Load Testing Demo with Prometheus and Grafana in Docker

### The goal of this project is to conduct website load testing using Grafana K6, export the results to a Prometheus time series database, and visualize and monitor the outcomes using a Grafana dashboard.

- Write a basic K6 performance test for demo purposes.
- Use Prometheus as an output in K6.
- Use Grafana to visualize that output coming from K6.
- Using Docker to setup and run K6, Prometheus & Grafana.

Grafana k6 is an open-source load testing tool is optimized for minimal resource consumption and designed for running high load tests. It’s implemented in the Go programming language, and you can define test scenarios using plain JavaScript.

Grafana enables the creation of custom dashboards to query and visualize data from diverse sources and back-ends. Meanwhile, k6 allows you to stream test results to any back-end by utilizing either a custom output extension or existing real-time output methods.

Prometheus remote write is a protocol supported by K6, that makes it possible to reliably propagate data in real-time from a sender to a receiver. Through the Prometheus remote write output, k6 can transmit test-result metrics to a designated Prometheus remote write endpoint. During the execution of a k6 run, this output captures all data points generated for both built-in and custom metrics, and subsequently converts them into corresponding Prometheus remote write time series data.

Docker enables the packaging of applications and dependencies into standardized container images, ensuring consistent operation across diverse environments. Instead of installing applications individually on a local machine, Docker Compose simplifies the process by defining all application services in a single YAML file. This includes specifying containers, dependencies, and communication settings among them.

### **Breaking it Down (docker-compose.yaml)**

<picture>
  <img alt="Shows an docker env." src="https://hashcodes.files.wordpress.com/2023/09/k6_prom_graphana.png">
</picture>

The Docker Compose YAML file configures the environment to launch Docker containers for K6, Prometheus, and Grafana dashboard images. Running a load test requires that the Prometheus and Grafana services are already running in the background. The file defines three networks: 'k6,' 'grafana,' and 'prometheus,' along with three services, respectively. 


+ image: specifies the name of docker images to be pulled fro the service to create the environment. 
+ networks: specifies the other docker networsk to which the current docker container can communicate.
+ ports: specifies the local netwrok ports on which the service will be running.
+ volumes: defines the local machine folders which mapped to the docker container linux folders.
+ environment: defines the environment variables for the docker container which will be consumed respective services. For example, K6_OUT=xk6-prometheus-rw environment varibles instruct K6 to write results into prometheus.
+ commands: the optional command line parameters to the service binary configured here. For example --config.file=/etc/prometheus/prometheus.yaml instructing prometheus srevice to look into prometheus.yaml file for it's configurations.+

Running a load test requires that the Prometheus and Grafana services are already running in the background. You can use docker-compose ‘up’ command to start them:
> docker-compose up -d prometheus grafana

The test case defenitiions are written in javascript and stored in /scripts folder. You can compose the K6 docker container and run it pointing to the exact test case defenition file to execute. For example here is thr script to execute /scripts/test_times.js
> docker-compose run --rm k6 run -o experimental-prometheus-rw /scripts/test_times.js 


