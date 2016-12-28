<?php
	// call this always before reading or writing to your filepath in concurrent situations
	function lockFile($filepath){
		clearstatcache();
		$lockname=$filepath.".lock";
		// if the lock already exists, get its age:
		$life=@filectime($lockname);
		// attempt to lock, this is the really important atomic action:
		while (!@mkdir($lockname)){
			die();
			if ($life)
				if ((time()-$life)>120){
				//release old locks
				rmdir($lockname);
				$life=false;
			}
			usleep(rand(50000,200000));//wait random time before trying again
		}
	}
	
	function unlockFile($filepath){
		$unlockname= $filepath.".lock";
		return @rmdir($unlockname);
	}
?>