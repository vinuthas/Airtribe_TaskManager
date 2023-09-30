class Validate
{
  static validateTasks (task)
  {
    for (let item of [ "title","description","status" ] ){
      if ( !this.checkFields( item,task ) )
        return { valid: false, message: `${ item } is required` }
    }
    if (typeof task.status != "boolean"){
      return { valid: false, message: `Invalid value for status` }
    }
    return { valid: true }
  }
  static checkFields (field,task)
  {
    if(task.hasOwnProperty( field )) return true
    else return false
  }
}
module.exports = Validate;