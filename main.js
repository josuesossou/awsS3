
"use strict";
// Strings
const S3_NOT_INIT_TEXT = 'please initialize s3 credentials on the settings page'
const IAM_TEXT = 'iam'
const COGNITOPOOL_TEXT = 'cognitopool'
const SUCCESS_STATUS = 'success'
const ERROR_STATUS = 'error' 
const NOT_INIT_STATUS = 'not initialized'

// Global Data
let SETTING_CREDENTIALS = {
  bucketName: '',
  region: '',
  credentials: {
    accessKeyId: '',
    secretAccessKey: '',
    expiration: null,
    sessionToken: null
  },
  poolId: ''
}
window.s3CredentialsStatus = NOT_INIT_STATUS
window.whichCredential = ''

/**  helper functions**/
const getElementById = (elementId) => {
  return document.getElementById(elementId)
}

const loadCredentials = async () => {
  const settingCredentials = localStorage.getItem('settingCredentials')
  if (!settingCredentials) return 

  SETTING_CREDENTIALS = JSON.parse(settingCredentials)
  if (!SETTING_CREDENTIALS.region || !SETTING_CREDENTIALS.bucketName) return

  aws_init(
    SETTING_CREDENTIALS.region.toLocaleLowerCase(), 
    SETTING_CREDENTIALS.bucketName,
    {iamCredentials: SETTING_CREDENTIALS.credentials})

  await isS3ConnectedCheck()

  if (s3CredentialsStatus === SUCCESS_STATUS) {
    window.isAwsInit = true
    window.whichCredential = IAM_TEXT
    return
  }
  
  aws_init(
    SETTING_CREDENTIALS.region.toLocaleLowerCase(), 
    SETTING_CREDENTIALS.bucketName, 
    {withPoolId:false, poolID: SETTING_CREDENTIALS.poolId})
  await isS3ConnectedCheck()

  if (s3CredentialsStatus === ERROR_STATUS) {
    window.isAwsInit = false
    window.whichCredential = ''
    return
  }

  window.isAwsInit = true
  window.whichCredential = COGNITOPOOL_TEXT
  return
}

const showFlashMessage = (message) => {
  const flashMessageEle = getElementById('flashcard-wrapper')

  flashMessageEle.style.display = 'block'
  flashMessageEle.innerHTML = `<center><p>${message}</p></center>`

  setTimeout(() => {
    flashMessageEle.innerHTML = ''
    flashMessageEle.style.display = 'none'
  }, 3000)
}
/*** End of helpsers */

/***  init aws s3 */
const initWithIAM = () => {
  let inputBucketName = getElementById('inputIAMBucketName')
  let inputRegion = getElementById('inputIAMRegion')
  let inputAccessKey = getElementById('inputIAMAccessKey')
  let inputSecretKey = getElementById('inputIAMSecretKey')

  if (!inputBucketName.value || 
    !inputRegion.value || 
    !inputAccessKey.value ||
    !inputSecretKey.value
  ) return showFlashMessage('1 or more fields are missing')

  if (!inputBucketName.value.trim() || 
    !inputRegion.value.trim() || 
    !inputAccessKey.value.trim() ||
    !inputSecretKey.value.trim()
  ) return showFlashMessage('1 or more fields are missing')

  const credentials = {
    accessKeyId: inputAccessKey.value.trim(),
    secretAccessKey: inputSecretKey.value.trim(),
    expiration: null,
    sessionToken: null
  }

  SETTING_CREDENTIALS = {
    bucketName: inputBucketName.value.trim(),
    region: inputRegion.value.trim(),
    credentials,
    poolId: SETTING_CREDENTIALS.poolId
  }
 
  aws_init(
    SETTING_CREDENTIALS.region.toLocaleLowerCase(), 
    SETTING_CREDENTIALS.bucketName, 
  {iamCredentials: credentials})
  isS3ConnectedCheck()
  .then(()=> {
    statusElement(IAM_TEXT, false)
    window.whichCredential = IAM_TEXT
  })
  .catch(() => {
    statusElement(IAM_TEXT)
    window.whichCredential = ''
  })
}

const initWithPool = () => {
  const inputBucketName = getElementById('inputPoolBucketName')
  const inputRegion = getElementById('inputPoolRegion')
  const inputPoolID = getElementById('inputPoolID')

  if (!inputBucketName.value || 
    !inputRegion.value || 
    !inputPoolID.value
  ) return showFlashMessage('1 or more fields are missing')

  if (!inputBucketName.value.trim() || 
    !inputRegion.value.trim() || 
    !inputPoolID.value.trim()
  ) return showFlashMessage('1 or more fields are missing')

  SETTING_CREDENTIALS = {
    bucketName: inputBucketName.value.trim(),
    region: inputRegion.value.trim(),
    credentials: SETTING_CREDENTIALS.credentials,
    poolId: inputPoolID.value.trim()
  }
 
  aws_init(
    SETTING_CREDENTIALS.region.toLocaleLowerCase(), 
    SETTING_CREDENTIALS.bucketName, 
    {withPoolId:false, poolID: SETTING_CREDENTIALS.poolId}
  )

  isS3ConnectedCheck()
  .then(()=> {
    statusElement(COGNITOPOOL_TEXT, false)
    window.whichCredential = COGNITOPOOL_TEXT
  })
  .catch(() => {
    statusElement(COGNITOPOOL_TEXT)
    window.whichCredential = ''
  })
}
/***  End of initialization */

/** UI maipulations */
const statusElement = (credentialType, isBad=true) => {
  const statusElement = getElementById(`check-${credentialType}-credentials`)

  if (isBad) {
    statusElement.innerHTML = `
      <button type="button" class="btn btn-danger">Bad Credentials</button>
    `
    return
  } 
  statusElement.innerHTML = `
    <button type="button" class="btn btn-success">Connected</button>
  `
}

const isS3ConnectedCheck = async () => {
  try {
    await s3.send(
      new ListObjectsCommand({ Delimiter: '/', Bucket: bucketName,  })
    )

    window.s3CredentialsStatus = SUCCESS_STATUS
  } catch (error) {
    window.s3CredentialsStatus = ERROR_STATUS
  }
}

/// save credentials to localstorage
const saveIAMCredentials = () => {
  if (s3CredentialsStatus !== SUCCESS_STATUS) {
    initWithIAM()
  }
  localStorage.setItem('settingCredentials', JSON.stringify(SETTING_CREDENTIALS))
  setSetting()

  const inputBucketName = getElementById('inputIAMBucketName')
  const inputRegion = getElementById('inputIAMRegion')
  const inputAccessKey = getElementById('inputIAMAccessKey')
  const inputSecretKey = getElementById('inputIAMSecretKey')

  inputRegion.value = SETTING_CREDENTIALS.region
  inputBucketName.value = SETTING_CREDENTIALS.bucketName
  inputAccessKey.value = SETTING_CREDENTIALS.credentials.accessKeyId.slice(0,2) + '***'
  inputSecretKey.value = SETTING_CREDENTIALS.credentials.secretAccessKey.slice(0,2) + '***'
  showFlashMessage("credentials were successfully saved")
}

const savePoolCredentials = () => {
  if (s3CredentialsStatus !== SUCCESS_STATUS) {
    initWithPool()
  }
  localStorage.setItem('settingCredentials', JSON.stringify(SETTING_CREDENTIALS))
  setSetting({ showIAM: false })

  const inputBucketName = getElementById('inputPoolBucketName')
  const inputRegion = getElementById('inputPoolRegion')
  const inputPoolID = getElementById('inputPoolID')

  inputRegion.value = SETTING_CREDENTIALS.region
  inputBucketName.value = SETTING_CREDENTIALS.bucketName
  inputPoolID.value = SETTING_CREDENTIALS.poolId.slice(0,2) + '***'
  showFlashMessage("credentials were successfully saved")
}

/// setting up credentials for both IAM and Cognito Pool
const editIAMCredentials = () => {
  setSetting({isIAMDisabled: false}) // to show the Iam pannel
  setIAMSettingCredentials()
}

const editPoolCredentials = () => {
  setSetting({isPoolDisabled: false, showIAM: false}) // to show the Pool pannel
  setPoolSettingCredentials() // set the text fields with the appropriate data
}

/// sets the full credentials to show up in the text fields
const setIAMSettingCredentials = () => {
  const inputBucketName = getElementById('inputIAMBucketName')
  const inputRegion = getElementById('inputIAMRegion')
  const inputAccessKey = getElementById('inputIAMAccessKey')
  const inputSecretKey = getElementById('inputIAMSecretKey')

  loadCredentials()

  inputRegion.value = SETTING_CREDENTIALS.region
  inputBucketName.value = SETTING_CREDENTIALS.bucketName
  inputAccessKey.value = SETTING_CREDENTIALS.credentials.accessKeyId
  inputSecretKey.value = SETTING_CREDENTIALS.credentials.secretAccessKey

  if (whichCredential === IAM_TEXT) {
    statusElement(IAM_TEXT, s3CredentialsStatus === ERROR_STATUS)
  }
}

/// sets the full credentials to show up in the text fields
const setPoolSettingCredentials = () => {
  const inputBucketName = getElementById('inputPoolBucketName')
  const inputRegion = getElementById('inputPoolRegion')
  const inputPoolID = getElementById('inputPoolID')

  loadCredentials()

  inputRegion.value = SETTING_CREDENTIALS.region
  inputBucketName.value = SETTING_CREDENTIALS.bucketName
  inputPoolID.value = SETTING_CREDENTIALS.poolId
  statusElement('cognitoPool', s3CredentialsStatus === ERROR_STATUS)

  if (whichCredential === COGNITOPOOL_TEXT) {
    statusElement(COGNITOPOOL_TEXT, s3CredentialsStatus === ERROR_STATUS)
  }
}
/** End of UI maipulations */

/**** AWS S3 CRUD Operations */
// list objects (Reading)
const listObjects = async () => {
  const objectListElement = getElementById("object-list")

  if (s3CredentialsStatus === ERROR_STATUS || s3CredentialsStatus === NOT_INIT_STATUS) {
    showFlashMessage(S3_NOT_INIT_TEXT)
    const htmlTemplate = `
    <p class='center'>
      <i class="fa fa-warning"></i> ${S3_NOT_INIT_TEXT}
    </p>
    `;
    objectListElement.innerHTML = htmlTemplate;
    return 
  } 

  try {
    const data = await s3.send(
      new ListObjectsCommand({ Delimiter: '/', Bucket: bucketName,  })
    );

    if (!data.Contents || data.Contents.length === 0) {
      const htmlTemplate = `
      <p class='center'>
        You do not have any object in this S3 bucket. Start adding objects to your S3 bucket by clicking the add button
      </p>`;
      objectListElement.innerHTML = htmlTemplate;
    } else {
      data.Contents.map((content) => {
        // const prefix = commonPrefix.Prefix;
        // const objectName = decodeURIComponent(prefix.replace("/", ""));
        const li = document.createElement('li')
        li.innerHTML = `
          <div><span>${content.Key}</span></div>
          <div class="todo-actions">
            <a class="todo-remove" onpointerup="deleteObject('${content.Key}')">
              <button class="btn btn-danger" style="color: white"><i class="fa fa-times" ></i> Delete</button>
            </a>
          </div>
          `;
          objectListElement.appendChild(li)
        });
      }
    } catch (err) {
      return showFlashMessage("There was an error listing your objects: " + err.message);
    }
  };
  
  // Add an object to an bucket (create)
  const addObject = async () => {
    if (s3CredentialsStatus === ERROR_STATUS || s3CredentialsStatus === NOT_INIT_STATUS) return showFlashMessage(S3_NOT_INIT_TEXT)
    const files = document.getElementById("objectInput").files;
    try {
      const file = files[0];
      const fileName = file.name;
      const objectKey = fileName;
      const uploadParams = {
        Bucket: bucketName,
        Key: objectKey,
        Body: file
      };
      try {
        await s3.send(new PutObjectCommand(uploadParams));
        showFlashMessage(`Successfully uploaded ${fileName}.`);
        setDashboard()
      } catch (err) {
        return showFlashMessage("There was an error uploading your file object: ", err.message);
      }
    } catch (err) {
      if (!files.length) {
        return showFlashMessage("Choose a file to upload first.");
      }
    }
  };
  
  // Delete an object from the bucket (delete)
  const deleteObject = async (objectKey) => {
    if (s3CredentialsStatus === ERROR_STATUS || s3CredentialsStatus === NOT_INIT_STATUS) return showFlashMessage(S3_NOT_INIT_TEXT)
      try {
        const params = {
          Bucket: bucketName,
          Key: objectKey,
          Quiet: true,
        };
        await s3.send(new DeleteObjectCommand(params));
        setDashboard();
        return showFlashMessage(`Successfully deleted ${objectKey}.`);
      } catch (err) {
        return showFlashMessage(`There was an error deleting ${objectKey}: ${err.message}`);
      }
  };
