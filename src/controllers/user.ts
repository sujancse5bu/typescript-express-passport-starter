import { Request, Response } from 'express'
import { body, check, validationResult } from "express-validator"
import { IUser, User } from '../models/User'


export const create = async (req: Request, res: Response/*, next: NextFunction*/): Promise<void> => {
  await check("email", "Email is not valid").isEmail().run(req);
  await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
  // await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      message: 'Validation Error!',
      errors
    });
  }

  console.log('req.body: ', req.body)
  // res.status(201).json({ message: 'User creation called successfully!' })
  // return

  const { email } = req.body
  
  const _user: IUser = await User.findOne({ email })
  if (_user) {
    res.status(400).json({
      message: 'User `' + email + '` already registered!'
    });
  } else {
    const {
      name,
      password,
    } = req.body
    const newUser = new User({
      name,
      email,
    });

    newUser.setPassword(password)
    try {
      await newUser.save()
      res.status(201).json({message: 'User created successfully!'})
    } catch (error) {
      res.status(500).json(error)
      return
    }
  }
  
}

export const getAll = async (req: Request, res: Response/*, next: NextFunction*/): Promise<void> => {
  
  try {
    const _users: IUser[] = await User.find({})
    const filteredUser = _users.map((_item) => {
      _item.passwordHash = undefined
      _item.passwordSalt = undefined
      _item.forgotPassword = undefined
      return _item
    })
    res.status(200).json(filteredUser)
  } catch (error) {
    res.status(500).json({ error });
  }
}

export const getById = async (req: Request, res: Response/*, next: NextFunction*/): Promise<void> => {
  
  try {
    const _user: IUser = await User.findById(req.params.id)
    _user.passwordHash = undefined
    _user.passwordSalt = undefined
    _user.forgotPassword = undefined
    res.status(200).json(_user)
  } catch (error) {
    res.status(500).json({ error });
  }
  
}

export const updateById = async (req: Request, res: Response/*, next: NextFunction*/): Promise<void> => {
  const {
    id
  } = req.params
  try {
    const _user: IUser = await User.findOneAndUpdate({ _id: id }, req.body, { new: true })
    _user.passwordHash = undefined
    _user.passwordSalt = undefined
    _user.forgotPassword = undefined
    res.status(200).json({
      user: _user,
      message: 'User updated Successfully'
    })
  } catch (error) {
    res.status(500).json({ error });
  }
  
}
export const deleteById = async (req: Request, res: Response/*, next: NextFunction*/): Promise<void> => {
  const {
    id
  } = req.params
  try {
    const _user: IUser = await User.findOneAndDelete({ _id: id })
    _user.passwordHash = undefined
    _user.passwordSalt = undefined
    _user.forgotPassword = undefined
    res.status(200).json({ message: 'User Deleted Successfully!!'})
  } catch (error) {
    res.status(500).json({ error });
  }
  
}