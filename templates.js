const appElement = document.getElementById('app')

const pageIndexes = {
    dashboard: 0,
    addNewObject: 1,
    settings: 2,
    help: 3
}

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
             
                <div class="row-sm-12 center">
                    ${actions.length > 0 ? '<hr class="solid mt-sm mb-lg">' : ''}
                    ${actions.map(action => (`
                        <button type="button" class="btn btn-${action.type}" ${action.method}>${action.name}</button>
                    `)).join('')}
                </div>
            </div>
        </div>
    `
}

const setLiActive = (index) => {
    const liList = document.querySelectorAll('.nav-main li')

    liList.forEach((node, ind) => {
        if (ind === index) {
            node.classList.add('nav-active')
        } else {
            node.classList.remove('nav-active')
        }
    })

}

const setDashboard = async () => {
    setLiActive(pageIndexes.dashboard)
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
    loadCredentials()
    .then(() => {
        listObjects()
    })
    .catch(e => {
        listObjects()
        console.log(e.message)
    })

}

const setSetting = ({isIAMDisabled=true, isPoolDisabled=true, showIAM=true} = {}) => {
    setLiActive(pageIndexes.settings)
    const IAMcontentHTML = `
    <p class="center"><i class="fa fa-warning"></i> Follow instructions on help page before initializing</p>
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
                <input type="text" class="secureInput form-control" id="inputIAMSecretKey" ${isIAMDisabled ? 'disabled' : ''}>
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
            method:`onpointerup="initWithIAM()"`,
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
            method:`onpointerup="initWithPool()"`

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
    setPoolSettingCredentials()

    checkesInitStatus({ isSettingsPage: true, showFlash: false })
}


const setNewObject = () => {
    setLiActive(pageIndexes.addNewObject)
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

const iamHelpSteps = [
    '<b>Step1:</b> Copy the code below (on this page) then open your S3 bucket page',
    '<b>Step2:</b> Click on the "Permissions" tab',
    '<b>Step3:</b> Scroll down until you find the card with title, Cross-origin resource sharing (CORS)',
    '<b>Step4:</b> Click on the "Edit" button',
    '<b>Step5:</b> Paste the code from Step1 into the edit box',
    '<b>Step6:</b> Click on "Save changes"',
    '<b>Step7:</b> On this page(s3.html), Click on "Setting" on the left and enter your s3 bucket IAM credentials and other information required'
]

const jsonFormat = [
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST",
            "GET",
            "DELETE"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]

const setHelp = async () => {
    setLiActive(pageIndexes.help)

    const contentIAMHTML = `
        <p> After you created your aws s3 bucket, open your bucket page and follow these steps: <p>
        <ul class="widget-todo-list" id="object-list" onload="listObjects()">
            ${iamHelpSteps.map(text => '<li class="ml-sm-9">' + text + "</li>").join('')}
        </ul>
        <hr class="solid mt-sm mb-lg">
        <h5>Code</h5>
        <pre>${JSON.stringify(jsonFormat, null, 4)}</pre>
    `
    const contentPoolHTML = `

    `
    const actions = []
    const contentIAM = getCollapseContent({ 
        contentHTML: contentIAMHTML, 
        actions,
        contentName:'Use IAM Credentials Prerequisite', 
        contentID:'helpIam',
        collapse: 'in'
    })
    const contentPool = getCollapseContent({ 
        contentHTML: contentPoolHTML, 
        actions,
        contentName:'Use Cognito Pool Credentials Prerequisite', 
        contentID:'helpPool',
        collapse: 'in'
    })
    const content = contentIAM + "<br>" + contentPool 

    const template = getHTMLTemplate(
        'Help', 
        content, 
    )

    appElement.innerHTML = template
}


window.onload = setDashboard