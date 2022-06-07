const appElement = document.getElementById('app')

const getHTMLTemplate = (templateName, content) => {
    const templateHeader = `
    <header class="page-header">
        <h2>${templateName}</h2>
    </header>
    `
    const templateContent = `
        <div class="row">
            <div class="col-12">
                <section class="panel panel-transparent">
                    <div class="panel-body">
                        <section class="panel panel-group">
                            <div id="accordion">
                                <div class="panel panel-accordion panel-accordion-first">
                                    ${content}
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </div>
    `
    const template = [
        templateHeader,
        templateContent
    ]

    return template.join('')
}

const getCollapseContent = ({contentHTML='', actions=[], contentName='', contentID='', collapse='in'} = {}) => {
    return `
        <div class="panel-heading row-lg-12">
            <h4 class="panel-title">
                <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#${contentID}">
                    <i class="fa fa-angle-down"></i> ${contentName} <i id="check-${contentID}-credentials"></i>
                </a>
            </h4>
            
        </div>
        <div id="${contentID}" class="accordion-body collapse ${collapse}">
            <div class="panel-body">
                ${contentHTML}
                <hr class="solid mt-sm mb-lg">
                <div class="row-sm-12 center">
                    ${actions.map(action => (`
                        <button type="button" class="btn btn-${action.type}" ${action.method}>${action.name}</button>
                    `))}
                </div>
            </div>
        </div>
    `
}

const setLiActive = (index) => {
    const liList = document.querySelectorAll('.nav-main li')

    console.log(liList)
    liList.forEach((node, ind) => {
        if (ind === index) {
            node.classList.add('nav-active')
        } else {
            node.classList.remove('nav-active')
        }
    })

}

const setDashboard = async () => {
    setLiActive(0)
    const contentHTML = `
        <ul class="widget-todo-list" id="object-list" onload="listObjects()"></ul>
    `
    const actions = [{name: 'Add Object', method:`onpointerup="setNewObject()"`, type: 'primary' }]
    const content = getCollapseContent({ contentHTML, actions, contentName:'Objects', contentID:'objects'})

    const template = getHTMLTemplate(
        'Dashboard', 
        content, 
    )

    appElement.innerHTML = template
    await loadCredentials()
    listObjects()
}

const setSetting = ({isIAMDisabled=true, isPoolDisabled=true, showIAM=true} = {}) => {
    setLiActive(2)
    const IAMcontentHTML = `
    <form class="form-horizontal form-bordered" method="get">
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMBucketName">Bucket Name</label>
            <div class="col-md-6">
                <input type="text" minLength='3' class="form-control" id="inputIAMBucketName" ${isIAMDisabled ? 'disabled' : ''}>
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMRegion">Region</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="inputIAMRegion" ${isIAMDisabled ? 'disabled' : ''}>
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMAccessKey">Access Key</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="inputIAMAccessKey" ${isIAMDisabled ? 'disabled' : ''}>
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputIAMSecretKey">Secret Key</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="inputIAMSecretKey" ${isIAMDisabled ? 'disabled' : ''}>
            </div>
        </div>
    </form>
    `

    const poolIDContentHTML = `
    <form class="form-horizontal form-bordered" method="get">
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputPoolBucketName">Bucket Name</label>
            <div class="col-md-6">
                <input type="text" minLength='3' class="form-control" id="inputPoolBucketName" ${isPoolDisabled ? 'disabled' : ''}>
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputPoolRegion">Region</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="inputPoolRegion" ${isPoolDisabled ? 'disabled' : ''}>
            </div>
        </div>
        <div class="form-group">
            <label class="col-md-3 control-label" for="inputPoolID">Pool ID</label>
            <div class="col-md-6">
                <input type="text" class="form-control" id="inputPoolID" ${isPoolDisabled ? 'disabled' : ''}>
            </div>
        </div>
    </form>
    `

    const actionsIAM = [
        {
            name: 'Save Credentials', 
            method:`onpointerup="saveIAMCredentials()" ${isIAMDisabled ? 'disabled' : ''}`,
            type: 'success'
        },
        {
            name: 'Initialize Credentials', 
            method:`onpointerup="initWithIAM()" ${isIAMDisabled ? 'disabled' : ''}`,
            type: 'warning'
        },
        {
            name: 'Edit Credentials', 
            method:`onpointerup="editIAMCredentials()"`,
            type: 'primary'
        }
    ]

    const actionsPool = [
        {
            name: 'Save Credentials', 
            type: 'success',
            method:`onpointerup="savePoolCredentials()" ${isPoolDisabled ? 'disabled' : ''}`,
        },
        {
            name: 'Initialize Credentials', 
            type: 'warning',
            method:`onpointerup="initWithPool()" ${isPoolDisabled ? 'disabled' : ''}`

        },
        {
            name: 'Edit Credentials', 
            type: 'primary',
            method:`onpointerup="editPoolCredentials()"`

        }
    ]

    const IAMContent = getCollapseContent({
        contentHTML: IAMcontentHTML, 
        actions: actionsIAM, 
        contentName: 'IAM Credentials [NOT RECOMMENDED]', 
        contentID:'iam', 
        collapse: showIAM? 'in': ''
    })
    const poolIDContent = getCollapseContent({
        contentHTML:poolIDContentHTML, 
        actions: actionsPool, 
        contentName:'Cognito Pool ID Credentials [RECOMMENDED]', 
        contentID: 'cognitopool', 
        collapse: showIAM?'':'in'
    })
    const content = IAMContent + "<br>" + poolIDContent

    const template = getHTMLTemplate(
        'Settings', 
        content,
    )

    appElement.innerHTML = template
    setIAMSettingCredentials()
}


const setNewObject = () => {
    setLiActive(1)
    const contentHTML = `
    <form class="form-horizontal form-bordered" method="get">
        <div class="form-group">
            <label class="col-md-3 control-label">Select File</label>
            <div class="col-md-6">
                <div class="fileupload fileupload-new" data-provides="fileupload">
                    <div class="input-append">
                        <div class="uneditable-input">
                            <i class="fa fa-file fileupload-exists"></i>
                            <span class="fileupload-preview"></span>
                        </div>
                        <span class="btn btn-default btn-file">
                            <span class="fileupload-exists">Change</span>
                            <span class="fileupload-new">Select file</span>
                            <input type="file" id="objectInput" />
                        </span>
                        <a href="#" class="btn btn-default fileupload-exists" data-dismiss="fileupload">Remove</a>
                    </div>
                </div>
            </div>
        </div>
    </form>
    `
    const actions = [{name: 'Add Object', method:`onpointerup="addObject()"`, type: 'primary' }]
    const content = getCollapseContent({
        contentHTML, 
        actions, 
        contentName: 'New Object', 
        contentID: 'newobjects'
    })

    const template = getHTMLTemplate(
        'Add New Object', 
        content, 
    )

    appElement.innerHTML = template
}


window.onload = setDashboard()