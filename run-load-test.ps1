docker-compose up -d prometheus grafana
Write-Output "--------------------------------------------------------------------------------------"
Write-Output "Load testing with Grafana dashboard http://localhost:3000/d/01npcT44k/official-k6-test-result?orgId=1"
Write-Output "--------------------------------------------------------------------------------------"
#docker-compose run --rm k6 run -o experimental-prometheus-rw /scripts/test_times.js 
docker-compose run --rm k6 run -o experimental-prometheus-rw /scripts/test_trusaic_login.js 

#docker compose down