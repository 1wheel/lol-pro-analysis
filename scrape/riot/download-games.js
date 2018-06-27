var { _, d3, fs, glob, io, queue, request } = require('scrape-stl')
var {exec, execSync} = require('child_process')

var q = queue(1)

var matches = glob.sync(__dirname + '/raw/highlanderMatchDetails/*')
  .map(io.readDataSync)

var matchPaths = glob.sync(__dirname + '/raw/highlanderMatchDetails/*')

var isHistoryDL  = _.indexBy(glob.sync(__dirname + '/raw/matchhistory/*').map(pathToSlug))
var isTimelineDl = _.indexBy(glob.sync(__dirname + '/raw/matchtimeline/*').map(pathToSlug))


matches.forEach((match, i) => {
  match.gameIdMappings.forEach(({id, gameHash}) => {
    q.defer(downloadPage, {gameId: id, gameHash, match})
  })
}) 

function downloadPage({gameId, gameHash, match}, cb){
  var {gameRealm, gameId} = match.match.games[gameId]
  var baseurl = 'https://acs.leagueoflegends.com/v1/stats/game/'
  var gameId = gameId.trim()
  
  console.log(gameId)
  if (isTimelineDl[gameId] && isHistoryDL[gameId]) return cb()


  var path = __dirname + `/raw/matchhistory/${gameId}.json`
  var url = `${baseurl}${gameRealm}/${gameId}?gameHash=${gameHash}&api_key=RGAPI-36a81422-d6a3-41a8-97a1-519053f0eda8`
  downloadCurl(path, url)
  console.log(url)
  
  var path = __dirname + `/raw/matchtimeline/${gameId}.json`
  var url = `${baseurl}${gameRealm}/${gameId}/timeline?gameHash=${gameHash}&api_key=RGAPI-36a81422-d6a3-41a8-97a1-519053f0eda8`
  downloadCurl(path, url)

  setTimeout(cb, 1000*2)
}

function pathToSlug(d){
  return _.last(d.split('/')).split('.')[0]
}



function downloadCurl(path, url, cb){
  var cmd = `curl -o ${path} '${url}' -H 'origin: https://matchhistory.na.leagueoflegends.com' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36' -H 'accept: application/json, text/javascript, */*; q=0.01' -H 'referer: https://matchhistory.na.leagueoflegends.com/en/' -H 'authority: acs.leagueoflegends.com' -H 'cookie: ping_session_id=226a1639-cfdd-4ff2-9e01-87e543de3bf2; _ga=GA1.2.1202946116.1429319960; new_visitor=false; ajs_user_id=null; ajs_group_id=null; s_cc=true; s_fid=3659B259ECFDC2B3-136DCACD57284E56; s_sq=%5B%5BB%5D%5D; __cfduid=d6d343fa20d0b15e0eef0fd440ac992ba1525366691; PVPNET_LANG=en_US; PVPNET_REGION=na; s_nr=1529195626038-Repeat; rp2=1529195626039-Repeat; s_ppv=lol2%253Ana%253Aen%253Aapollo%2520forums%253Aen%253Agameplay-balance%253Acan%2520riot%2520fuck%2520off%2520with%2520api%2520changes%2520already%253F%2520you%2527re%2520literally%2520making%2520sites%2520like%2520op.gg%2520unusable%2C37%2C6%2C884; _gid=GA1.2.189190994.1529195905; _gat=1' --compressed`

  // console.log(cmd)

  exec(cmd, (error, stdout, stderr) => {
    if (error)  console.error(`exec error: ${error}`)
    // if (stdout) console.log(`stdout: ${stdout}`);
    if (stderr) console.log(`stderr: ${stderr}`);
    if (cb) cb()
  })

}

