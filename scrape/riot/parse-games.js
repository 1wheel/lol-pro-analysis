var { _, d3, fs, glob, io, queue, request } = require('scrape-stl')


var matches = glob.sync(__dirname + '/raw/matchtimeline/*').forEach((path, i) => {
  console.log(path)
  var game = path.split('matchtimeline/')[1].replace('.json', '')
  
  var outFrames = []
  var outEvents = []
  io.readDataSync(path).frames.forEach(d => {
    var timestamp = d.timestamp
    // console.log(timestamp)
    d3.values(d.participantFrames).forEach(d => {
      d.game = game
      d.timestamp = timestamp

      if (d.position) flattenPosition(d)

      outFrames.push(d)
    })

    d.events.forEach(d => {
      d.game = game

      if (d.position) flattenPosition(d)

      if (d.assistingParticipantIds) d.assistingParticipantIds = d.assistingParticipantIds.join(' ')

      outEvents.push(d)
    })
  })

  function flattenPosition(d){
    var {x, y} = d.position
    d.x = x
    d.y = y
    delete d.position
  }


  var outPath = path
    .replace('matchtimeline', 'matchtimeline-frames')
    .replace('.json', '.csv')

  io.writeDataSync(outPath, outFrames)


  var outPath = path
    .replace('matchtimeline', 'matchtimeline-events')
    .replace('.json', '.csv')

  io.writeDataSync(outPath, outEvents)

})
