async function upload(){
    const file = document.getElementById("audio").files[0]
    const status = document.getElementById("status")

    if(!file){
        alert("Select audio file")
        return
    }

    status.innerText = "Processing..."

    let formData = new FormData()
    formData.append("audio", file)

    let res = await fetch("/upload",{
        method:"POST",
        body:formData
    })

    let data = await res.json()

    if(data.job_id)
        checkStatus(data.job_id)
}

async function checkStatus(id){
    const status = document.getElementById("status")

    let interval = setInterval(async ()=>{
        let res = await fetch(`/status/${id}`)
        let data = await res.json()

        if(data.status==="done"){
            clearInterval(interval)
            status.innerText="Completed"
            document.getElementById("output").value=data.text
        }
        else
            status.innerText="Processing..."
    },2000)
}

function downloadText(){
    let text = document.getElementById("output").value
    let blob = new Blob([text],{type:"text/plain"})
    let link=document.createElement("a")
    link.href=URL.createObjectURL(blob)
    link.download="transcript.txt"
    link.click()
}