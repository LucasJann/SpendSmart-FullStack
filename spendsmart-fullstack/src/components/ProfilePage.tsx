import React, { useEffect, useState } from "react";

import Image from "./Image";
import Input from "./Input";
import Button from "./Button";
import NavBar from "./NavBar";
import landScape from "../images/landscape.jpg";
import profilePic from "../images/profilepic.jpg";

const Profile = () => {
  interface formProperties {
    image: boolean;
    disabled: boolean;
    onConfirm: boolean;
    editBalance: boolean;
  }

  const formValues = {
    image: false,
    disabled: true,
    onConfirm: false,
    editBalance: false,
  };
  const [formState, setFormState] = useState<formProperties>(formValues);

  const [balance, setBalance] = useState<number>(0);

  const [imageSaved, setImageSaved] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string>(profilePic);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (imageSaved === false) {
      const handleBeforeUnload = async () => {
        if (selectedImage) {
          const selectedImageState = selectedImage.split("src\\")[1];

          const bodyImage = {
            selectedImage: selectedImageState,
          };

          try {
            await fetch(`http://localhost:8080/profile/clearImage`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(bodyImage),
            });
          } catch (err) {
            console.error(err);
          }
        }
      };
      handleBeforeUnload();
    }
  }, [imageSaved]);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (selectedImage) {
        const selectedImageState = selectedImage.split("src\\")[1];

        const bodyImage = {
          selectedImage: selectedImageState,
        };

        try {
          await fetch(`http://localhost:8080/profile/clearImage`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyImage),
          });
        } catch (err) {
          console.error(err);
        }
      }
    };

    if (selectedImage !== undefined) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handleBeforeUnload);
    }
  }, [selectedImage]);

  useEffect(() => {
    const fetchData = async () => {
      const user = localStorage.getItem("user")?.replace(/"/g, "");
      try {
        const [profileResponse, balanceResponse] = await Promise.all([
          fetch(`http://localhost:8080/profile/${user}`),
          fetch(`http://localhost:8080/balance/${user}`),
        ]);

        if (!profileResponse.ok) {
          throw new Error(
            `Failed to fetch profile data. Status: ${profileResponse.status}`
          );
        }
        const profileJson = await profileResponse.json();
        const fetchedProfileImage = profileJson.image
          ? `../../backend/src/images/${profileJson.image.split("images\\")[1]}`
          : profilePic;
        setProfileImage(fetchedProfileImage);

        if (!balanceResponse.ok) {
          throw new Error(
            `Failed to fetch balance data. Status: ${balanceResponse.status}`
          );
        }
        const balanceJson = await balanceResponse.json();
        setBalance(balanceJson.balance || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [formState.onConfirm]);

  const formatBalance = (value: number) => {
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
    return formatter.format(value / 100);
  };

  const handleImageClick = () => {
    setFormState((prevState) => ({
      ...prevState,
      image: true,
    }));
  };

  const imageChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const formData = new FormData();
    const inputImage = e.currentTarget;

    if (inputImage.files && inputImage.files.length > 0) {
      formData.append("image", inputImage.files[0]);
    }

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      const user = localStorage.getItem("user")?.replace(/"/g, "");
      const response = await fetch(
        `http://localhost:8080/profile/image/${user}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error("Error to fetch");
      }

      const responseData = await response.json();
      const newProfileImage = responseData.path
        ? `../../backend/src/images/${responseData.path.split("images\\")[1]}`
        : profilePic;

      setSelectedImage(responseData.path);
      setProfileImage(newProfileImage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    const inputElement = event.currentTarget.getElementsByTagName("input")[0];

    if (inputElement.files && inputElement.files.length > 0) {
      formData.append("image", inputElement.files[0]);
    }

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      const user = localStorage.getItem("user")?.replace(/"/g, "");
      await fetch(`http://localhost:8080/profile/${user}`, {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
    setImageSaved(true);
    setFormState((prevState) => ({
      ...prevState,
      image: false,
      onConfirm: !formState.onConfirm,
    }));
  };

  const getBalanceTextColor = () => {
    if (balance > 0) {
      return "text-green-300";
    } else if (balance < 0) {
      return "text-red-300";
    }
    return "text-gray-300";
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, "");
    setBalance(Number(value));
  };

  return (
    <div
      className="flex justify-center h-screen bg-cover bg-center bg-no-repeat caret-transparent w-full"
      style={{ backgroundImage: `url(${landScape})` }}
    >
      <div className="w-full flex flex-col items-center justify-center h-screen">
        <NavBar />
        <Image
          src={profileImage}
          alt="Profile Pic"
          onClick={handleImageClick}
          className="w-64 h-64 rounded-full "
        />
        {formState.image && (
          <form onSubmit={handleImageUpload}>
            <Input
              id="image"
              name="image"
              type="file"
              onChange={imageChanged}
              className="w-5/6 border-2 border-r-0 text-white mt-1 p-0.5 pb-1 bg-black bg-opacity-60 shadow-mg"
            />
            <Button
              id="image"
              type="submit"
              className=" w-1/6 border-2 border-l-0 text-center p-2 bg-yellow-500 text-white text-sm"
            >
              OK
            </Button>
          </form>
        )}
        <div className="text-white text-4xl items-start"></div>
        <div className="flex max-w-md w-5/6 bg-black bg-opacity-60 shadow-mg rounded-md p-2 mb-5 mt-2 text-white">
          <h2 className="w-1/2">Your balance:</h2>
          <Input
            id="balance"
            type="text"
            name="balance"
            className={`w-full rounded-md shadow-sm focus:ring-0 border-transparent ${getBalanceTextColor()} bg-transparent text-center text-md`}
            value={formatBalance(balance)}
            onChange={handleValueChange}
            disabled={formState.disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
