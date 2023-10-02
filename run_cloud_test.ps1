#k6 login cloud --token ad100e0fc8841e6c9ad5cc0ab32e1cd897e1498d94795d0c4856f80c644dc1a0
#k6 run --out cloud /scripts/trusaic_cloud_test.js
#k6 run --out experimental-prometheus-rw /scripts/start_trusaic_load.js 
#docker-compose run --rm k6 login cloud --token ad100e0fc8841e6c9ad5cc0ab32e1cd897e1498d94795d0c4856f80c644dc1a0
#docker-compose run --rm k6 run -o experimental-prometheus-rw /scripts/start_trusaic_load.js 
#docker-compose run --rm k6 run -o experimental-prometheus-rw /scripts/trusaic_cloud_test.js
#-e K6_PROMETHEUS_RW_TREND_AS_NATIVE_HISTOGRAM=true `
cat .\scripts\trusaic_cloud_test.js | `
    docker run --rm -i --cap-add=SYS_ADMIN `
    -e K6_OUT=xk6-prometheus-rw `
    -e K6_PROMETHEUS_RW_INSECURE_SKIP_TLS_VERIFY=true `
    -e K6_PROMETHEUS_RW_PUSH_INTERVAL=5s `
    -e K6_PROMETHEUS_RW_SERVER_URL=https://prometheus-prod-13-prod-us-east-0.grafana.net/api/prom/push `
    -e K6_PROMETHEUS_RW_USERNAME=1212056 `
    -e K6_PROMETHEUS_RW_PASSWORD=glc_eyJvIjoiOTU1MzE1IiwibiI6InBkYy1xYXRydXNhaWMtZGVmYXVsdC1xYXRydXNhaWNrNi13cmlldCIsImsiOiJkejc2SDdJM2dFOVkzMDVKWE5uMWI4ZEciLCJtIjp7InIiOiJwcm9kLXVzLWVhc3QtMCJ9fQ== `
    grafana/k6:master-with-browser run -o experimental-prometheus-rw -