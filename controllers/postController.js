// controllers/postController.js

import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

// Get all posts with details and user info
// Get all posts with detailed information
// Get all posts with detailed information
export const getDetailedPosts = async (req, res) => {
  const { page = 1, limit = 10, ...query } = req.query;

  try {
    const skip = (page - 1) * limit;
    const take = parseInt(limit, 10);

    // Filtrer par les prix
    const filters = {
      price: {
        gte: query.minPrice ? parseInt(query.minPrice, 10) : 0,
        lte: query.maxPrice ? parseInt(query.maxPrice, 10) : 100000000,
      },
    };

    // Ajouter un filtre pour plusieurs propriétés
    if (query.property) {
      const properties = query.property.split(','); // Séparer les propriétés par des virgules
      filters.property = {
        in: properties,
      };
    }

    if (query.city) {
      filters.city = query.city;
    }
    if (query.type) {
      filters.type = query.type;
    }
    if (query.bedRooms) {
      filters.bedRooms = parseInt(query.bedRooms, 10);
    }

    // Exécuter la requête Prisma
    const posts = await prisma.post.findMany({
      skip,
      take,
      where: filters,
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
            telephone: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getDetailedPosts:", error);
    res.status(500).json({ message: "Failed to get posts" });
  }
};



// Get all posts
export const getPosts = async (req, res) => {
    const query = req.query;
   // console.log(query);
    try {
        const posts = await prisma.post.findMany({
            where: {
                city: query.city || undefined,
                type: query.type || undefined,
                property: query.property || undefined,
                bedRooms: parseInt(query.bedRooms) || undefined,
                price: {
                    gte: parseInt(query.minPrice) || 0,
                    lte: parseInt(query.maxPrice) || 100000000,
                },
              
            },
        });

        setTimeout(() => {
            res.status(200).json(posts);
        }, 200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get posts" });
    }
};

// Get a single post by ID
export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await prisma.post.findUnique({
            where: { id:id, },
            include: {
                postDetail: true,
                user: {
                    select: {
                        username: true,
                        avatar: true,
                        telephone: true,
                    },
                },
            },
        });

        const token = req.cookies?.token;

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
                if (!err) {
                    const saved = await prisma.savedPost.findUnique({
                        where: {
                            userId_postId: {
                                postId: id,
                                userId: payload.id,
                            },
                        },
                    });
                    res.status(200).json({ ...post, isSaved: saved ? true : false });
                } else {
                    res.status(500).json({ message: "Failed to verify JWT" });
                }
            });
        } else {
            res.status(200).json({ ...post, isSaved: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to get post" });
    }
};

// Add a new post
// Add a new post
export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;
    const tokenUserRole = req.userRole;
  
    if (tokenUserRole === 'Utilisateur') {
      return res.status(403).json({ message: "Non Autorisé" });
    }
  
    try {
      const newPost = await prisma.post.create({
        data: {
          ...body.postData,
          userId: tokenUserId,
          postDetail: {
            create: body.postDetail,
          },
        },
      });
      res.status(200).json(newPost);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to create post" });
    }
  };
  

// Update a post
// Update a post
export const updatePost = async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    const tokenUserId = req.userId;
    const tokenUserRole = req.userRole;
  
    if (tokenUserRole === 'Utilisateur') {
      return res.status(403).json({ message: "Non Autorisé" });
    }
  
    try {
      const post = await prisma.post.findUnique({
        where: { id },
      });
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      if (post.userId !== tokenUserId && tokenUserRole !== 'Admin') {
        return res.status(403).json({ message: "Non Autorisé" });
      }
  
      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          title: body.postData.title,
          price: body.postData.price,
          images: body.postData.images,
          address: body.postData.address,
          city: body.postData.city,
          bedRooms: body.postData.bedRooms,
          bathRooms: body.postData.bathRooms,
          latitude: body.postData.latitude,
          longitude: body.postData.longitude,
          type: body.postData.type,
          etat: body.postData.etat,
          property: body.postData.property,
        },
      });
  
      const updatedPostDetail = await prisma.postDetail.upsert({
        where: { postId: id },
        update: {
          description: body.postDetail.description,
          utilities: body.postDetail.utilities,
          pet: body.postDetail.pet,
          income: body.postDetail.income,
          size: body.postDetail.size,
          school: body.postDetail.school,
          bus: body.postDetail.bus,
          status: body.postDetail.status,
          tramway: body.postDetail.tramway,
        },
        create: {
          postId: id,
          description: body.postDetail.description,
          utilities: body.postDetail.utilities,
          pet: body.postDetail.pet,
          income: body.postDetail.income,
          size: body.postDetail.size,
          school: body.postDetail.school,
          bus: body.postDetail.bus,
          status: body.postDetail.status,
          tramway: body.postDetail.tramway,
        },
      });
  
      res.status(200).json({ ...updatedPost, postDetail: updatedPostDetail });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update post" });
    }
  };
  

// Delete a post
export const deletePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;
    const tokenUserRole = req.userRole;
  
    if (tokenUserRole === 'Utilisateur') {
      return res.status(403).json({ message: "Non Autorisé" });
    }
  
    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: { postDetail: true } // Include related postDetail
      });
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      if (post.userId !== tokenUserId && tokenUserRole !== 'Admin') {
        return res.status(403).json({ message: "Non Autorisé" });
      }
  
      // If postDetail exists, delete it first
      if (post.postDetail) {
        await prisma.postDetail.delete({
          where: { id: post.postDetail.id }
        });
      }
  
      // Now delete the post
      await prisma.post.delete({
        where: { id },
      });
  
      res.status(200).json({ message: "Post deleted!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  };
  
