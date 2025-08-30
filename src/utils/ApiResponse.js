class ApiResponse {
    constructor(statusCode,data,message="true"){
        //now overriding such parameter
        this.statusCode = statusCode <400
        this.data = data
        this.message = message

    }
}
export {ApiResponse}